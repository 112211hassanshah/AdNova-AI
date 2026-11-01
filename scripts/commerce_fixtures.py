"""Rebuild clearly fictional commerce examples; never reads merchant files."""

import csv
import random
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "backend/src/ads_optimizer/commerce/fixtures"
PLATFORMS = ["Facebook", "Instagram", "Google", "TikTok", "YouTube"]


def write(name, rows):
    fields = list(dict.fromkeys(key for row in rows for key in row))
    with (ROOT / name).open("w", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)


def main():
    ROOT.mkdir(parents=True, exist_ok=True)
    specs = [
        (
            "A",
            "2026-01-01",
            "paid",
            2500,
            250,
            0,
            0,
            100,
            0,
            "fb-01",
            "main",
            "Facebook",
            "2026-01-01",
            "",
            "",
        ),
        (
            "B",
            "2026-01-02",
            "partially_refunded",
            2000,
            0,
            550,
            500,
            100,
            50,
            "g-01",
            "main",
            "Google",
            "2026-01-01",
            "",
            "",
        ),
        (
            "C",
            "2026-01-03",
            "refunded",
            1000,
            0,
            1000,
            1000,
            0,
            0,
            "fb-01",
            "main",
            "Facebook",
            "2026-01-03",
            "",
            "",
        ),
        (
            "D",
            "2026-01-02",
            "paid",
            1200,
            0,
            0,
            0,
            0,
            0,
            "fb-01",
            "main",
            "Facebook",
            "2026-01-02",
            "",
            "",
        ),
        (
            "E",
            "2026-01-02",
            "paid",
            800,
            0,
            0,
            0,
            0,
            0,
            "",
            "",
            "",
            "",
            "facebook.com",
            "newsletter",
        ),
        (
            "F",
            "2026-01-02",
            "paid",
            500,
            50,
            0,
            0,
            0,
            0,
            "shared-01",
            "",
            "Facebook",
            "2026-01-02",
            "",
            "",
        ),
        (
            "G",
            "2026-01-03",
            "paid",
            1500,
            100,
            0,
            0,
            50,
            0,
            "",
            "",
            "",
            "2026-01-03",
            "merchant-google",
            "winter-launch",
        ),
        ("H", "2026-01-03", "pending", 700, 0, 0, 0, 0, 0, "", "", "", "", "", ""),
    ]
    generic, shopify = [], []
    for (
        letter,
        day,
        status,
        gross,
        discount,
        total_refund,
        refund,
        shipping,
        shipping_refund,
        campaign,
        account,
        platform,
        touch,
        utm_source,
        utm_campaign,
    ) in specs:
        row = {
            "order_id": f"#FIC-{letter}",
            "ordered_at": f"{day}T10:00:00+05:00",
            "financial_status": status,
            "fulfillment_status": "fulfilled",
            "currency": "PKR",
            "gross_item_sales": gross,
            "discounts": discount,
            "refunded_amount": total_refund,
            "merchandise_refunds": refund,
            "shipping_charged": shipping,
            "shipping_refunded": shipping_refund,
            "tax": 0,
            "cancelled_at": f"{day}T12:00:00+05:00" if letter == "D" else "",
            "campaign_id": campaign,
            "account_id": account,
            "platform": platform,
            "ad_touch_at": f"{touch}T09:00:00+05:00" if touch else "",
            "utm_source": utm_source,
            "utm_campaign": utm_campaign,
            "is_synthetic": "true",
        }
        generic.append(row)
        standard = {
            "Name": row["order_id"],
            "Created at": row["ordered_at"],
            "Financial Status": status,
            "Fulfillment Status": "fulfilled",
            "Currency": "PKR",
            "Subtotal": gross - discount,
            "Discount Amount": discount,
            "Refunded Amount": total_refund,
            "Shipping": shipping,
            "Taxes": 0,
            "Canceled at": row["cancelled_at"],
            "Lineitem SKU": f"SKU-{letter}",
            "Lineitem quantity": 1,
            "Lineitem price": gross,
            "Lineitem discount": 0,
            "refunded_quantity": 1 if letter == "C" else 0,
            **{
                key: row[key]
                for key in [
                    "merchandise_refunds",
                    "shipping_refunded",
                    "campaign_id",
                    "account_id",
                    "platform",
                    "ad_touch_at",
                    "utm_source",
                    "utm_campaign",
                    "is_synthetic",
                ]
            },
            "Email": "fictional-buyer@example.test",
            "Billing Name": "Fictional Buyer",
        }
        if letter == "A":
            standard.update(
                {"Lineitem SKU": "SKU-A", "Lineitem quantity": 2, "Lineitem price": 1000}
            )
        shopify.append(standard)
        if letter == "A":
            shopify.append(
                {
                    "Name": row["order_id"],
                    "Lineitem SKU": "SKU-A2",
                    "Lineitem quantity": 1,
                    "Lineitem price": 500,
                    "Lineitem discount": 0,
                    "refunded_quantity": 0,
                    "is_synthetic": "true",
                }
            )
    write("pilot-generic.csv", generic)
    write("pilot-shopify.csv", shopify)
    costs = [
        (1100, 70, 100, 30, 0),
        (600, 50, 100, 20, 0),
        (0, 20, 100, 20, 0),
        (0, 10, 0, 0, 0),
        (300, 20, 50, 10, 0),
        (200, 20, 50, 10, 0),
        (700, 40, 70, 20, 0),
        (0, 0, 0, 0, 0),
    ]
    write(
        "pilot-expenses.csv",
        [
            {
                "order_id": f"#FIC-{letter}",
                **dict(
                    zip(
                        [
                            "cogs",
                            "payment_fees",
                            "fulfillment",
                            "packaging",
                            "other_variable_costs",
                        ],
                        values,
                        strict=True,
                    )
                ),
                "currency": "PKR",
                "is_synthetic": "true",
            }
            for letter, values in zip("ABCDEFGH", costs, strict=True)
        ],
    )
    write(
        "pilot-sku-costs.csv",
        [
            {
                "sku": f"SKU-{sku}",
                "unit_cost": cost,
                "effective_from": "2026-01-01",
                "effective_to": "2026-12-31",
                "currency": "PKR",
                "is_synthetic": "true",
            }
            for sku, cost in [
                ("A", 350),
                ("A2", 400),
                ("B", 600),
                ("C", 500),
                ("D", 0),
                ("E", 300),
                ("F", 200),
                ("G", 700),
                ("H", 0),
            ]
        ],
    )
    ads = []
    for day, platform, campaign, account, spend, revenue in [
        ("2026-01-01", "Facebook", "fb-01", "main", 150, 2500),
        ("2026-01-01", "Google", "g-01", "main", 200, 3000),
        ("2026-01-02", "Facebook", "shared-01", "one", 150, 500),
        ("2026-01-02", "Facebook", "shared-01", "two", 150, 500),
        ("2026-01-03", "Facebook", "fb-01", "main", 150, 2500),
        ("2026-01-03", "Google", "g-01", "main", 200, 3000),
    ]:
        ads.append(
            {
                "date": day,
                "campaign": f"Fictional {campaign} {account}",
                "campaign_id": campaign,
                "account_id": account,
                "platform": platform,
                "spend": spend,
                "revenue": revenue,
                "impressions": 1000,
                "clicks": 100,
                "conversions": 5,
                "conversion_definition": "purchases",
                "attribution_window": "7-day click",
                "is_synthetic": "true",
            }
        )
    write("pilot-ads.csv", ads)
    rng = random.Random(42)
    orders, expenses, ads = [], [], []
    for day_index in range(90):
        day = (date(2026, 7, 1) + timedelta(days=day_index)).isoformat()
        for index, platform in enumerate(PLATFORMS):
            spend = rng.randint(20000, 60000) / 100
            net = round((2.8 + index * 0.5) * 2 * spend / (1 + spend / 300), 2)
            order_id = f"HISTORY-{day_index}-{index}"
            orders.append(
                {
                    "order_id": order_id,
                    "ordered_at": f"{day}T12:00:00+05:00",
                    "financial_status": "paid",
                    "currency": "PKR",
                    "gross_item_sales": net,
                    "discounts": 0,
                    "refunded_amount": 0,
                    "merchandise_refunds": 0,
                    "shipping_charged": 0,
                    "shipping_refunded": 0,
                    "tax": 0,
                    "campaign_id": f"history-{index}",
                    "account_id": "fictional-history",
                    "platform": platform,
                    "ad_touch_at": f"{day}T11:00:00+05:00",
                    "is_synthetic": "true",
                }
            )
            expenses.append(
                {
                    "order_id": order_id,
                    "cogs": round(net * 0.4, 2),
                    "payment_fees": 0,
                    "fulfillment": 0,
                    "packaging": 0,
                    "other_variable_costs": 0,
                    "currency": "PKR",
                    "is_synthetic": "true",
                }
            )
            ads.append(
                {
                    "date": day,
                    "campaign": f"Fictional history {platform}",
                    "campaign_id": f"history-{index}",
                    "account_id": "fictional-history",
                    "platform": platform,
                    "spend": spend,
                    "revenue": round(net * 1.2, 2),
                    "conversion_definition": "purchases",
                    "attribution_window": "same-day click",
                    "is_synthetic": "true",
                }
            )
    write("history-orders.csv", orders)
    write("history-costs.csv", expenses)
    write("history-ads.csv", ads)


if __name__ == "__main__":
    main()
