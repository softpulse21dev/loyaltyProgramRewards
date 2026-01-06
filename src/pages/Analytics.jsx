import React, { useCallback, useEffect, useState } from "react";
import { Page, Grid, SkeletonBodyText, Card } from "@shopify/polaris";
import "@shopify/polaris-viz/build/esm/styles.css";
import DateRangePicker from "../components/DateRangePicker";
import { fetchData } from "../action";
import ChartCard from "../components/ChartCard";

function Analytics() {
    const [analyticsData, setAnalyticsData] = useState({});
    const [summaryData, setSummaryData] = useState({});
    const [chartLoading, setChartLoading] = useState(false);

    const today = new Date(new Date().setHours(0, 0, 0, 0));
    const last30DaysSince = new Date(today);
    last30DaysSince.setDate(today.getDate() - 29);
    const formatDate = (date) =>
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const [inputValues, setInputValues] = useState({
        since: formatDate(last30DaysSince),
        until: formatDate(today),
    });

    const fetchAnalyticsAPI = useCallback(async () => {
        setChartLoading(true);
        try {
            const formData = new FormData();
            formData.append("start_date", inputValues.since);
            formData.append("end_date", inputValues.until);
            const response = await fetchData("/get-analytics", formData);
            console.log('Analyticsresponse', response);
            if (response) {
                setAnalyticsData(response.charts);
                setSummaryData(response.summary);
            } else {
                shopify.toast.show(response?.message, { duration: 2000, isError: true });
            }
        } catch (error) {
            console.error('Error fetching analytics', error);
        } finally {
            setChartLoading(false);
        }
        console.log('analyticsData', analyticsData)
    }, [inputValues]);

    useEffect(() => {
        fetchAnalyticsAPI();
    }, [fetchAnalyticsAPI]);

    return (
        <Page
            title="Analytics"
            primaryAction={<DateRangePicker inputValues={inputValues} setInputValues={setInputValues} />}
            fullWidth
        >
            <Grid>
                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 4, xl: 4 }}>
                    {chartLoading ?
                        <Card>
                            <SkeletonBodyText lines={10} />
                        </Card> :

                        <ChartCard
                            title="Total Earned Points"
                            amount={summaryData?.total_points_earned}
                            data={analyticsData?.points_earned}
                            seriesName="Earned Points"
                        />
                    }
                </Grid.Cell>

                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 4, xl: 4 }}>
                    {chartLoading ?
                        <Card>
                            <SkeletonBodyText lines={10} />
                        </Card> :

                        <ChartCard
                            title="Total Earned Points"
                            amount={summaryData?.total_points_earned}
                            data={analyticsData?.points_earned}
                            seriesName="Earned Points"
                        />
                    }
                </Grid.Cell>

                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 4, xl: 4 }}>
                    {chartLoading ?
                        <Card>
                            <SkeletonBodyText lines={10} />
                        </Card> :

                        <ChartCard
                            title="Total Spent Points"
                            amount={summaryData?.total_points_spent}
                            data={analyticsData?.points_spent}
                            seriesName="Spent Points"
                        />
                    }
                </Grid.Cell>

                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 4, xl: 4 }}>
                    {chartLoading ?
                        <Card>
                            <SkeletonBodyText lines={10} />
                        </Card> :
                        <ChartCard
                            title="Total points given manually"
                            amount={summaryData?.total_points_manual}
                            data={analyticsData?.points_manual}
                            seriesName="Given Points"
                        />
                    }
                </Grid.Cell>

                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 4, xl: 4 }}>
                    {chartLoading ?
                        <Card>
                            <SkeletonBodyText lines={10} />
                        </Card> :
                        <ChartCard
                            title="Total Rewards Claimed"
                            amount={summaryData?.total_rewards_claimed}
                            data={analyticsData?.rewards}
                            seriesName="Rewards Claimed"
                        />
                    }
                </Grid.Cell>
            </Grid>
        </Page>
    );
}

export default Analytics;