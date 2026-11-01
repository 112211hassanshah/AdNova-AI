# Phase 2 completion report

Completed 2026-10-28: real local Big Data generation, processing experiments and the responsive Big Data Lab.

All 36 repeated correctness checks passed: four required scales × three engines × three repeats. The final matrix ran separately from tests/builds and reused checksum-verified synthetic Parquet inputs.

| Synthetic rows | Pandas median (s) | Local MapReduce median (s) | PySpark local median (s) | Pandas mode |
| ---: | ---: | ---: | ---: | --- |
| 10,000 | 0.003 | 0.012 | 0.133 | in memory |
| 100,000 | 0.009 | 0.060 | 0.186 | in memory |
| 1,000,000 | 0.070 | 0.560 | 0.373 | in memory |
| 10,000,000 | 0.990 | 5.393 | 1.799 | chunked |

Times include projected Parquet reads, aggregation and weighted metric materialization. Setup, generation and checksums are excluded and separately recorded. OS/JVM caches are not flushed. These are local measurements on this particular machine, not a general performance ranking or distributed-cluster benchmark.

Final configuration: seed 42; 2026-01-01–2026-03-31; PKR; Facebook/Instagram/Google/TikTok/YouTube; 50K-row physical chunks; three repeats; two workers; 2,048 MiB allowance. Python 3.12.14, Pandas 2.3.3, PySpark 4.2.1 and verified project-local Java 17.0.21. The 10M input contains 200 Parquet parts and occupies about 201 MiB on disk.

The lab persists jobs and inputs separately from campaign reports, supports cancellation and recovery, enforces bounded generation and resource checks, and exposes actual repeats, setup, throughput, sampled process-tree RSS, correctness, source/configuration/checksums and environment. JSON/CSV exports retain measured observations and non-successes. Only complete correct repeats produce medians.

Validation: 56 backend tests; 36 browser checks; TypeScript/ESLint, production build, Ruff and Prettier passed. Lab reviewed at seven widths from 375 to 1440px and all seven routes at desktop/mobile. Real browser cancellation removed unfinished 10M generation; dedicated tests also stopped Spark JVM descendants and an orphan process group after its runner exited. No uncaught browser JavaScript/hydration errors were captured.

Evidence: [measured JSON](phase-2-benchmark-measurements.json), [individual CSV timings](phase-2-benchmark-timings.csv), [browser checks](phase-2-browser-results.json), [method and limitations](phase-2-methodology.md), [progress](progress.md).

Current limits: synthetic academic data, single local user, sampled RSS, warm caches/fixed engine order, latest 30 jobs in the UI, manual report retention, no raw large-input download and no distributed Hadoop/cluster. Full assistive-technology certification and WebKit/Firefox validation were not performed. No ML model, recommendation, commerce importer or live connection has been implemented in this phase.

Phase 3 is the next slice: leakage-safe chronological model training, holdout/baseline evaluation and ML Studio. It has not started. Project 1 remains untouched.
