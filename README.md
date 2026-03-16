# DemoBlaze Performance Testing

This repository contains an Apache JMeter performance test suite for https://www.demoblaze.com and a GitHub Actions CI workflow to run tests, generate dashboards, upload artifacts, and send notifications.

## Scope

The test plan is defined in `DemoBlaze_Performance_Test_Plan.jmx` and includes five thread groups:

| Thread Group (in CI summary) | JMX Thread Group Name | Purpose |
|---|---|---|
| baseline | Baseline Load - 50 Users | Baseline user traffic and response behavior |
| medium_load | Medium Load - 150 Users | Moderate concurrent load validation |
| peak_load | Peak Load - 300 Users | Peak traffic verification |
| stress_test | Stress Test - 500 Users | Breakpoint and failure behavior under extreme load |
| endurance_test | Endurance Test | Stability and resource behavior over sustained duration |

## Test Flow

Each virtual user executes a realistic shopping flow:

1. Login
2. View products
3. View product details
4. Add to cart
5. View cart
6. Place order (delete cart)

Test data sources:

- `test_data/users.csv`
- `test_data/products.csv`

## Repository Layout

```text
.
|- DemoBlaze_Performance_Test_Plan.jmx
|- .github/
|  \- workflows/
|     \- performance-test.yml
|- results/
|  |- baseline_load.jtl
|  |- medium_load.jtl
|  |- peak_load.jtl
|  |- stress_test.jtl
|  \- endurance_test.jtl
|- reports/
|  |- baseline_load/
|  |- medium_load/
|  |- peak_load/
|  |- stress_test/
|  \- endurance_test/
\- test_data/
	 |- users.csv
	 \- products.csv
```

## Prerequisites

- Java 11+
- Apache JMeter 5.6.3+ (project CI installs 5.6.3)

## Run Locally (Non-GUI)

Run all thread groups from the JMX in CLI mode:

```bash
jmeter -n -t DemoBlaze_Performance_Test_Plan.jmx -j results/jmeter.log
```

Generate a dedicated HTML dashboard for each thread group from the generated JTL files:

```bash
jmeter -g results/baseline_load.jtl  -o reports/baseline_load
jmeter -g results/medium_load.jtl    -o reports/medium_load
jmeter -g results/peak_load.jtl      -o reports/peak_load
jmeter -g results/stress_test.jtl    -o reports/stress_test
jmeter -g results/endurance_test.jtl -o reports/endurance_test
```

Open `index.html` inside each report folder to inspect charts and stats.

## GitHub Actions Workflow

Workflow file: `.github/workflows/performance-test.yml`

Trigger conditions:

- Push to `main`
- Push to `master`
- Manual run via `workflow_dispatch`

Pipeline behavior:

1. Uses `ubuntu-latest`
2. Installs Java and Apache JMeter
3. Runs JMeter in non-GUI mode (`jmeter -n`)
4. Generates one HTML report per thread group
5. Uploads each report as a separate artifact
6. Parses result stats and builds a summary table
7. Sends Slack and Email notifications

## Metrics Extracted Per Thread Group

The workflow parses each report's `statistics.json` (`Total` section) and extracts:

- Total samples
- Error count
- Pass percentage
- Fail percentage

Percentage formulas used by the workflow:

- Pass percentage = `100 - errorPct`
- Fail percentage = `errorPct`

## Uploaded Artifacts

Each workflow run uploads:

- `report-baseline-load`
- `report-medium-load`
- `report-peak-load`
- `report-stress-test`
- `report-endurance-test`
- `jmeter-log`

## Notification Configuration

Configure these GitHub Actions secrets in your repository:

| Secret Name | Used For |
|---|---|
| `SLACK_WEBHOOK_URL` | Slack completion notification |
| `NOTIFY_EMAIL_FROM` | Sender email address |
| `NOTIFY_EMAIL_TO` | Recipient email address(es) |
| `SMTP_SERVER` | SMTP host |
| `SMTP_PORT` | SMTP port (commonly 587) |
| `SMTP_USERNAME` | SMTP account username |
| `SMTP_PASSWORD` | SMTP account password |

Notes:

- Email supports comma-separated recipients in `NOTIFY_EMAIL_TO`.
- If Slack or SMTP secrets are missing, the workflow skips that notification gracefully.

## Troubleshooting

- If HTML report generation fails, ensure the target `reports/<thread_group>` directory is removed before running `jmeter -g ... -o ...`.
- If all samples show zero in summary, confirm the corresponding `.jtl` file was generated and is not empty.
- If email sending fails, verify SMTP credentials and that STARTTLS is supported by your SMTP provider.

## Maintainer Notes

- Keep thread group names and result file names aligned in the JMX and workflow.
- If you add a new thread group, update:
	- JMX result collector output path
	- report generation step
	- artifact upload step
	- summary parser group mapping

