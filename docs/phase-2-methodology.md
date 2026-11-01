# Phase 2: measured local Big Data experiments

This is the university experiment on synthetic advertising data. Its results
validate local processing behavior, not real advertising performance. Merchants
do not need millions of records for daily analytics.

## Input and reproducibility

Four required scales are supported and were actually measured: 10,000; 100,000;
1,000,000; and 10,000,000 rows. Seed 42, 2026-01-01 through 2026-03-31, all five
platforms, 50,000-row Parquet parts, Snappy compression, two local workers,
2,048 MiB memory allowance, and three repeats per engine form the recorded matrix.

Generation uses fixed 10K logical blocks of the existing coherent simulator,
independently seeded by NumPy SeedSequence([seed, block_index]). Campaign IDs
include the block index so campaign/day grain stays unique. Platform weights,
Pakistan geography, simulated funnel, seasonality, fatigue and saturation are
preserved; each block covers the configured period. This block structure is a
simulation assumption, not an empirical model of a merchant. The logical rows
stay deterministic across physical chunk sizes. No 10M-row DataFrame is created.

Lab inputs are isolated from advertiser CSVs and Overview's selected campaign
dataset. Every manifest records its configuration, simulator version, file
checksums, actual disk bytes and independent reference aggregates. Reuse verifies
each file SHA256 before processing. Deleting an input preserves its old reports.

## Equivalent workload and correctness

All engines read the same Parquet files and project the same six fields:
platform, impressions, clicks, spend, conversions and revenue. They group by
platform and calculate row counts, metric sums and non-null counts. Money sums
use integer paisa; fractional conversions use integer millionths. All-missing
or partially missing metrics yield null totals. Rates are calculated afterward:
CTR=clicks/impressions×100, CPC=spend/clicks, CPA=spend/conversions,
CVR=conversions/clicks×100, ROAS=revenue/spend. Zero denominators yield null.

An independent vector-mask accumulator records reference unit sums during
generation. Every repeat must exactly match platform keys, row/non-null counts
and scaled-integer sums. Derived floating rates use rtol=atol=1e-9. A manually
calculated test fixture also exercises all paths with fractional conversions,
missing revenue and zero denominators. A failed gate prevents a median.

Pandas performs a standard in-memory groupby when rows×200 bytes is no more than
40% of the chosen memory allowance; otherwise its explicitly labelled chunked
path reduces bounded batches. At the recorded 10M scale it used chunks.
Local MapReduce maps records in Python worker processes, combines keyed partials,
shuffles/groups those partials locally and reduces sums/counts. Only platform
partials enter the shuffle. PySpark uses a DataFrame groupBy/agg in local[2].
Neither implementation claims Hadoop or distributed cluster execution.

## Measurement scope and limits

Each repeat includes projected Parquet reads, aggregation, weighted-rate
calculation and materialization of the five output rows. Setup, including JVM
startup or mapper readiness, is measured separately. Generation and checksum
verification are excluded. No unreported data warm-up or application cache is
used; OS and JVM caches are not flushed. Engines run sequentially in the order
Pandas, MapReduce, Spark. First-repeat costs and order/cache effects are visible
in individual runs. Medians describe warm-cache local behavior and are not a
general ranking of engine scalability.

Peak memory is a sampled sum of RSS for an engine process and its descendants,
including mapper processes and the Spark JVM, at 150 ms intervals. Shared memory
may be counted multiple times and short peaks may be missed. It is not whole-
system memory. Unavailable measurements stay null. Native-library threads are
bounded where supported; the recorded worker count is not a claim that every
engine uses identical internal threads. The final matrix ran without concurrent
test/build workloads. It is a reproducible local experiment, not a laboratory
isolation guarantee.

There is one local job, 1–4 workers, a 512–4096 MiB sampled memory allowance,
10-minute engine and 30-minute job deadlines. The allowance must fit within 70%
of currently available RAM when measurable. Generation checks memory at chunk
boundaries. New generation requires conservative free disk of rows×1024 bytes
plus 1 GiB reserve; this is a safety gate, not an estimated actual Parquet size.
Jobs exceeding limits stop and report a failure/skip without invented timings.

Cancellation is checked between chunks and while monitoring engine processes.
Engine process groups and descendants are stopped. Saved inputs/completed
measurements persist, incomplete generation is removed. Jobs survive HTTP server
reloads; stopped coordinators are marked interrupted when the lab next checks
them, and verified orphan sessions/incomplete inputs are cleaned up. Process
inspection denied by the OS is treated as unknown, not proof of worker death.

## Evidence and reproduction

Run `.venv/bin/python scripts/benchmark_phase2.py` with both local services up.
The JSON contains every repeat, setup/runtime/throughput/memory, correctness,
input configuration/checksums, method and actual environment; CSV is one row per
repeat, with non-successes recorded explicitly. The lab chart groups matching
seed, dates, platforms, chunk size, repeat count, worker/memory limits,
generator/benchmark implementation and software/hardware versions. Missing
measurements are gaps, never fabricated values. Only the latest 30 jobs are
listed in the interface; older reports remain accessible by their known IDs.

- `docs/phase-2-benchmark-measurements.json`: final measured four-scale matrix.
- `docs/phase-2-benchmark-timings.csv`: final individual timing rows.
- `data/benchmarks/jobs/<id>/`: durable snapshots, JSON reports and local logs.
- `data/benchmarks/datasets/<id>/`: partitioned input and evaluation-only truth.

The final report records macOS arm64, 10 reported logical CPUs, 16 GiB total RAM,
Python 3.12.14, Pandas 2.3.3, PyArrow 26.0.0, PySpark 4.2.1 and Java 17.0.21.
These are measured host/package observations, not assumed hardware capabilities.

## Runtime installation and primary sources

PySpark and psutil are isolated in `.venv`; exact resolved versions are in
`requirements.lock.txt`. Pandas is constrained below 3 because Spark emitted a
compatibility warning about some Pandas 3 features during the first smoke run.
Final measurements use Pandas 2.3.3. No warning was suppressed.

Java was absent. Official Eclipse Temurin 17.0.21+9 macOS aarch64 JDK was downloaded
to ignored `.runtime/` and its archive SHA256 verified before extraction:
`78b08c7f5a0598242d5719c022e19479cb4a3aa45c37c19726a757a469ed1c15`.
The app discovers that project-local JDK or honors `JAVA_HOME`. No system runtime
or model setting was changed. Spark's optional native-Hadoop warning uses the
built-in Java path; no Hadoop installation/cluster is claimed.

Primary references consulted:

- [Apache Spark installation](https://spark.apache.org/docs/latest/api/python/getting_started/install.html)
- [Apache Spark execution/runtime overview](https://spark.apache.org/docs/latest/index.html)
- [Eclipse Temurin archive installation and verification](https://adoptium.net/installation/archives)
- [Installed official Java release archive](https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.21%2B9/OpenJDK17U-jdk_aarch64_mac_hotspot_17.0.21_9.tar.gz)

ML training, allocation, commerce ingestion and live integrations remain outside
Phase 2. Project 1 is untouched. The current app is local and single-user, with
no authentication or production multi-tenant security.
