"""Prepare a reproducible, labelled university demo through the running HTTP API."""

import argparse
import json
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from decimal import Decimal
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--origin", default="http://127.0.0.1:8000")
    parser.add_argument("--restore-selection", action="store_true")
    parser.add_argument("--output", type=Path, default=Path("reports/phase5"))
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)

    def request(path, body=None, method=None):
        data = json.dumps(body).encode() if body is not None else None
        req = urllib.request.Request(
            args.origin + "/api/v1" + path,
            data=data,
            method=method,
            headers={"Content-Type": "application/json"},
        )
        try:
            with urllib.request.urlopen(req, timeout=60) as response:
                return response.read()
        except urllib.error.HTTPError as error:
            raise RuntimeError(f"{path}: HTTP {error.code}: {error.read().decode()}") from error

    def api(path, body=None, method=None):
        return json.loads(request(path, body, method))

    def save(name, value):
        (args.output / name).write_text(json.dumps(value, indent=2) + "\n")

    before = api("/workspace")
    if api("/ml")["active_job"]:
        raise RuntimeError("Finish or cancel the current model training before running the demo.")
    try:
        source = next(
            (
                d
                for d in before["datasets"]
                if (
                    d["source"] == "synthetic_generator"
                    and d["seed"] == 42
                    and d["rows"] == 10000
                    and d["date_start"] == "2026-01-01"
                    and d["date_end"] == "2026-03-31"
                    and len(d["options"]["platform"]) == 5
                )
            ),
            None,
        )
        if source is None:
            source = api(
                "/datasets/generate",
                {
                    "name": "University demo · synthetic · seed 42",
                    "rows": 10000,
                    "seed": 42,
                    "start_date": "2026-01-01",
                    "end_date": "2026-03-31",
                },
            )
        api("/workspace/dataset", {"dataset_id": source["id"]}, "PUT")
        print(f"Synthetic campaign source: {source['id']} (10,000 rows, seed 42)", flush=True)
        analytics = api(f"/datasets/{source['id']}/analytics?group_by=platform")
        save("analytics.json", analytics)
        for metric in ["spend", "revenue", "roas"]:
            if analytics["totals"][metric] is None:
                raise RuntimeError(f"Seeded demo lacks {metric}.")

        config = {
            "dataset_id": source["id"],
            "seed": 42,
            "as_of_date": "2026-10-29",
            "label_lag_days": 0,
        }
        ready = api("/ml/readiness", config)
        save("readiness.json", ready)
        job = api("/ml/jobs", config)
        deadline = time.monotonic() + 180
        while job["status"] not in {"succeeded", "failed", "cancelled", "interrupted"}:
            if time.monotonic() > deadline:
                api(f"/ml/jobs/{job['id']}/cancel", {})
                raise RuntimeError("Demo training exceeded 180 seconds; cancellation requested.")
            time.sleep(0.5)
            job = api(f"/ml/jobs/{job['id']}")
        save("model-evaluation.json", job)
        if job["status"] != "succeeded" or not job["result"]["acceptance"]["eligible"]:
            raise RuntimeError(
                "Demo model did not pass. Inspect model-evaluation.json; gates unchanged."
            )
        result = job["result"]
        print(f"Actual {result['algorithm']} fit passed the saved acceptance policy.", flush=True)
        save("reevaluation.json", api(f"/ml/models/{job['id']}/evaluate", {}))
        plans = []
        for budget in [1000000, 54321.87, 500]:
            plan = api(
                "/optimizer/plans",
                {
                    "dataset_id": source["id"],
                    "method": "auto",
                    "budget": budget,
                    "start_date": "2026-10-30",
                    "horizon_days": 7,
                    "as_of_date": "2026-10-29",
                    "label_lag_days": 0,
                },
            )
            if sum(Decimal(str(a["budget"])) for a in plan["allocations"]) != Decimal(str(budget)):
                raise RuntimeError("Allocation does not equal the exact user budget.")
            if budget == 1000000 and (plan["model_id"] != job["id"] or not plan["prediction_rows"]):
                raise RuntimeError("Million-PKR demo did not use the newly trained model.")
            if budget == 500 and plan["totals"]["estimated_revenue"] is not None:
                raise RuntimeError("Unsupported small-budget revenue should be withheld.")
            save(f"plan-{budget}.json", plan)
            (args.output / f"plan-{budget}.csv").write_bytes(
                request(f"/optimizer/plans/{plan['id']}/export?format=csv")
            )
            plans.append(
                {
                    "id": plan["id"],
                    "budget": budget,
                    "method": plan["method_label"],
                    "estimated_revenue": plan["totals"]["estimated_revenue"],
                    "prediction_rows": plan["prediction_rows"],
                }
            )
            print(f"PKR {budget:,.2f}: exact total; {plan['method_label']}", flush=True)
        save(
            "manifest.json",
            {
                "recorded_at": datetime.now(timezone.utc).isoformat(),
                "source": "Synthetic university demo; not real business performance",
                "dataset_id": source["id"],
                "model_id": job["id"],
                "algorithm": result["algorithm"],
                "holdout": result["test"],
                "plans": plans,
                "benchmark_evidence": "docs/phase-2-benchmark-measurements.json",
                "benchmarks_rerun": False,
            },
        )
        print(f"Saved evidence under {args.output}. Open http://127.0.0.1:3000", flush=True)
    finally:
        if args.restore_selection:
            api("/workspace/dataset", {"dataset_id": before["selected_dataset_id"]}, "PUT")


if __name__ == "__main__":
    main()
