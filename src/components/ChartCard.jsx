import { BlockStack, Card, Text } from '@shopify/polaris';
import { LineChart } from '@shopify/polaris-viz';
import React from 'react'

const ChartCard = ({ title, amount, data = [], seriesName }) => {

    const formattedData = data.map(item => ({
        key: item.date ?? item.key,
        value: item.value,
    }));
    return (
        <Card>
            <BlockStack gap="400">
                <BlockStack gap="200">
                    <Text variant="headingSm" as="h6" tone="subdued">
                        {title}
                    </Text>
                    <Text variant="headingXl" as="h4">
                        {amount}
                    </Text>
                </BlockStack>

                <div style={{ height: "250px", width: "100%" }}>
                    <LineChart
                        data={[
                            {
                                name: seriesName,
                                data: formattedData,
                            },
                        ]}
                        theme="Light"
                        isAnimated
                        smooth
                        showLegend={true}
                        xAxisOptions={{
                            labelFormatter: (value) => value,
                        }}
                    />
                </div>
            </BlockStack>
        </Card>
    );
};

export default ChartCard;
