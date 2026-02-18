import { Box, Card, Icon, Text } from '@shopify/polaris'
import { QuestionCircleIcon } from '@shopify/polaris-icons'
import React from 'react'

const NeedSupport = () => {
    return (
        <Card>
            <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Box><Icon source={QuestionCircleIcon} /></Box>
                <Text as="h1" variant="headingMd">Need Support?</Text>
            </Box>
            <Box style={{ paddingTop: '8px' }}>
                <Text>For support and query please drop us email on <b>support@leoapps.io</b></Text>
            </Box>
        </Card >
    )
}

export default NeedSupport