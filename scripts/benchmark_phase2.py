"""Run the required local scale matrix through the real job API and save evidence."""

import argparse
import csv
import io
import json
import time
import urllib.request
from datetime import datetime, timezone
from pathlib import Path


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--origin", default="http://127.0.0.1:8000")
    parser.add_argument("--scales", nargs="+", type=int, default=[10000, 100000, 1000000, 10000000])
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--memory-mib", type=int, default=2048)
    args = parser.parse_args()
    reports = []

    def request(path, body=None):
        data = json.dumps(body).encode() if body is not None else None
        req = urllib.request.Request(
            args.origin + path, data=data, headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=30) as response:
            return response.read()

    output = Path(__file__).resolve().parents[1] / "docs"
    for scale in args.scales:
        config = {"rows": scale, "seed": args.seed, "memory_mib": args.memory_mib}
        job = json.loads(request("/api/v1/lab/jobs", config))
        print(f"{scale:,} rows: job {job['id']}", flush=True)
        last = None
        while True:
            job = json.loads(request(f"/api/v1/lab/jobs/{job['id']}"))
            state = (job["status"], job["stage"])
            if state != last:
                print(f"{scale:,} rows: {job['status']} / {job['stage']}", flush=True)
                last = state
            if job["status"] in {"completed", "failed", "cancelled", "interrupted"}:
                break
            time.sleep(1)
        report = json.loads(request(f"/api/v1/lab/jobs/{job['id']}/export"))
        reports.append(report)
        # Save after every scale so an interrupted matrix retains its measured evidence.
        (output / "phase-2-benchmark-measurements.json").write_text(
            json.dumps(
                {
                    "recorded_at": datetime.now(timezone.utc).isoformat(),
                    "source": "Measured local synthetic academic experiments; "
                    "not business performance.",
                    "reports": reports,
                },
                indent=2,
            )
        )
        for result in report["results"]:
            print(
                f"  {result['engine']}: {result['status']}; "
                f"median={result.get('median_seconds')} s; "
                f"peak_tree_rss={result.get('peak_tree_rss_bytes')} bytes",
                flush=True,
            )
    csv_output = io.StringIO()
    writer = csv.writer(csv_output)
    for index, report in enumerate(reports):
        content = request(f"/api/v1/lab/jobs/{report['id']}/export?format=csv").decode()
        rows = list(csv.reader(io.StringIO(content)))
        writer.writerows(rows if index == 0 else rows[1:])
    (output / "phase-2-benchmark-timings.csv").write_text(csv_output.getvalue())
    failures = [
        f"{r['config']['rows']}: {e['engine']} {e['status']}"
        for r in reports
        for e in r["results"]
        if e["status"] != "completed"
    ]
    print(
        "Matrix recorded."
        + (
            " Non-successes: " + "; ".join(failures)
            if failures
            else " All engines passed every repeat."
        ),
        flush=True,
    )
    if any(r["status"] != "completed" for r in reports):
        raise SystemExit(1)


if __name__ == "__main__":
    main()
