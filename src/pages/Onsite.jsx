import React from "react";
import { Grid, LineChart, PolarisVizProvider } from "@shopify/polaris-viz";
import "@shopify/polaris-viz/build/esm/styles.css";
import { Card, InlineGrid, Page } from "@shopify/polaris";

function Onsite() {
    const chartData = [
        {
            name: "Sales Series",
            data: [
                { key: "Jan", value: 120 },
                { key: "Feb", value: 150 },
                { key: "Mar", value: 130 },
                { key: "Apr", value: 180 },
                { key: "May", value: 160 },
                { key: "Jun", value: 200 },
            ],
        },
        {
            name: "Expenses Series",
            data: [
                { key: "Jan", value: 80 },
                { key: "Feb", value: 90 },
                { key: "Mar", value: 110 },
                { key: "Apr", value: 100 },
                { key: "May", value: 120 },
                { key: "Jun", value: 130 },
            ],
        },
    ];

    return (
        <Page>
            <InlineGrid>
                <Card>
                    <div style={{ height: "50px", width: "100%" }}>
                        <h3>Sales & Expenses Over Time</h3>

                        <LineChart
                            data={chartData}
                            title="Financial Overview"
                            isAnimated
                            theme="Light"
                            xAxisOptions={{
                                labelFormatter: (value) => value,
                            }}
                            yAxisOptions={{
                                labelFormatter: (value) => `${value}`,
                            }}
                        />
                    </div>
                </Card>
                <Card>
                    <div style={{ height: "400px", width: "100%" }}>
                        <h3>Sales & Expenses Over Time</h3>
                        <LineChart
                            data={chartData}
                            title="Financial Overview"
                            isAnimated
                            theme="Light"
                            xAxisOptions={{
                                labelFormatter: (value) => value,
                            }}
                            yAxisOptions={{
                                labelFormatter: (value) => `${value}`,
                            }}
                        />
                    </div>
                </Card>
            </InlineGrid>
        </Page>
    );
}

export default Onsite;