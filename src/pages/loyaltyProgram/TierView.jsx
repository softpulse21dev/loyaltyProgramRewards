import { Box, Button, Card, Layout, Page, Text } from '@shopify/polaris'
import React from 'react'
import { useNavigate } from 'react-router-dom';

const TierView = () => {
    const navigate = useNavigate();
    return (
        <Page backAction={{ content: 'Back', onAction: () => navigate('/loyaltyProgram') }} title="VIP Tier">
            <Layout.AnnotatedSection
                title={'VIP Tier Status'}
                description={'Activate/Deactivate your VIP Tier program'}
            >
                <Card>
                    <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Text variant="headingMd">This feature is Deactivated</Text>
                        <Button primary>Activate</Button>
                    </Box>
                </Card>
            </Layout.AnnotatedSection>
        </Page>
    )
}

export default TierView
