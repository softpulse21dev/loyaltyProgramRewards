import { Badge, Box, Button, Card, Grid, Icon, Image, Label, MediaCard, Page, SkeletonBodyText, SkeletonPage, Text, Thumbnail } from '@shopify/polaris'
import { NoteIcon } from '@shopify/polaris-icons'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { fetchData } from '../action';

const Onsite = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [widgetStatus, setWidgetStatus] = useState(null);
    const [onsiteSettings, setOnsiteSettings] = useState(null);


    const fetchWidgetStatusAPI = async () => {
        try {
            setLoading(true);
            const formData = new FormData();
            const response = await fetchData('/get-onsite-settings', formData);
            console.log('response', response);
            if (response.status) {
                setWidgetStatus(response?.settings?.is_enabled);
            }
        } catch (error) {
            console.error('Error fetching widget status', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchWidgetStatusAPI();
    }, []);

    return (
        <>
            {loading ?
                (
                    <SkeletonPage>
                        <SkeletonBodyText lines={10} />
                    </SkeletonPage>
                )
                : (
                    <Page title="Onsite elements" subtitle="Choose how and where your program appears to customers">
                        <Card>
                            <Grid columns={{ xs: 1, sm: 1, md: 2, lg: 2, xl: 3 }}>
                                <Grid.Cell columnSpan={{ xs: 1, sm: 1, md: 1, lg: 1, xl: 1 }}>
                                    <MediaCard
                                        size='medium'
                                        portrait={true}
                                        title="Floating widget"
                                        description="A loyalty widget for a standard experience. Users can preview points and rewards by clicking on the widget bubble."
                                        primaryAction={{
                                            content: 'Select & Continue',
                                            onAction: () => { navigate('/onsite/widget') }
                                        }}
                                    >
                                        <Box style={{ backgroundColor: '#f5f5f5' }}>
                                            <Box style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '8px' }}>
                                                <Badge tone={widgetStatus ? 'success' : 'critical'}> {widgetStatus ? 'Enabled' : 'Disabled'} </Badge>
                                            </Box>
                                            <Box width="100%" height="100%" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                <Image
                                                    width="200px"
                                                    height="150px"
                                                    style={{ objectFit: 'cover', objectPosition: 'center' }}
                                                    source='https://tse4.mm.bing.net/th/id/OIP.fmwbDyeUmvd1oNM2jedz_wHaFj?rs=1&pid=ImgDetMain&o=7&rm=3'
                                                    alt="Floating widget"
                                                />
                                            </Box>
                                        </Box>
                                    </MediaCard>
                                </Grid.Cell>




                                {/* <Grid.Cell columnSpan={{ xs: 1, sm: 1, md: 1, lg: 1, xl: 1 }}>
                                <MediaCard
                                    size='medium'
                                    portrait={true}
                                    title="Dedicated loyalty page"
                                    description="Give customers a dedicated page to explore your loyalty program, earn points, and track rewards."
                                    primaryAction={{
                                        content: 'Select & Continue',
                                        onAction: () => { console.log('View') }
                                    }}
                                >
                                    <Box style={{ backgroundColor: '#f5f5f5' }}>
                                        <Box style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '8px' }}>
                                            <Badge tone='success'> Enabled </Badge>
                                        </Box>
                                        <Box width="100%" height="100%" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                            <Image
                                                width="200px"
                                                height="150px"
                                                style={{ objectFit: 'cover', objectPosition: 'center' }}
                                                source='https://tse4.mm.bing.net/th/id/OIP.fmwbDyeUmvd1oNM2jedz_wHaFj?rs=1&pid=ImgDetMain&o=7&rm=3'
                                                alt="Dedicated loyalty page"
                                            />
                                        </Box>
                                    </Box>
                                </MediaCard>
                            </Grid.Cell>
                            <Grid.Cell columnSpan={{ xs: 1, sm: 1, md: 1, lg: 1, xl: 1 }}>
                                <MediaCard
                                    size='medium'
                                    portrait={true}
                                    title="Customer Account Page"
                                    description="Create a dedicated customer account page where customers can track their loyalty progress, view rewards, and manage their referrals"
                                    primaryAction={{
                                        content: 'Select & Continue',
                                        onAction: () => { console.log('View') }
                                    }}
                                >
                                    <Box style={{ backgroundColor: '#f5f5f5' }}>
                                        <Box style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '8px' }}>
                                            <Badge tone='success'> Enabled </Badge>
                                        </Box>
                                        <Box width="100%" height="100%" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                            <Image
                                                width="200px"
                                                height="150px"
                                                style={{ objectFit: 'cover', objectPosition: 'center' }}
                                                source='https://tse4.mm.bing.net/th/id/OIP.fmwbDyeUmvd1oNM2jedz_wHaFj?rs=1&pid=ImgDetMain&o=7&rm=3'
                                                alt="Customer Account Page"
                                            />
                                        </Box>
                                    </Box>
                                </MediaCard>
                            </Grid.Cell> */}
                            </Grid>
                        </Card>
                    </Page>
                )}
        </>

    )
}

export default Onsite
