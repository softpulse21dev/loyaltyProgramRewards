import { Badge, Banner, Box, Button, Card, Page, Tabs, Text } from '@shopify/polaris'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import General from './widgetTabs/General';
import StoreFront from './widgetTabs/StoreFront';
import Launcher from './widgetTabs/Launcher';

const Widget = () => {
    const navigate = useNavigate();
    const [isEnabled, setIsEnabled] = useState(true);
    const [selectedTab, setSelectedTab] = useState(0);
    const handleToggle = () => {
        setIsEnabled(!isEnabled);
    };
    const tabs = [
        {
            id: 'widget-tab',
            content: 'General',
            panelID: 'general-content',
        },
        {
            id: 'settings-tab',
            content: 'Storefront app',
            panelID: 'store-front-content',
        },
        {
            id: 'appearance-tab',
            content: 'Launcher',
            panelID: 'launcher-content',
        },
    ]
    const [widgetData, setWidgetData] = useState({
        is_enabled: false,
        general: {
            styles: {
                presentation: "popup",
                position: "right",
                header: {
                    header_type: "solid",
                    solid: "#3c5e89",
                    gradient: {
                        color1: "#3c56e9",
                        color2: "#2035a7"
                    },
                    image: "",
                    header_bar_color: "#000000",
                    header_bar_text_color: "#ffffff",
                    text_color: "#ffffff"
                },
                content: {
                    background_type: "solid",
                    solid: "#3c5e89",
                    image: "",
                    heading_color: "#1a1a1a",
                    text_color: "#555555"
                },
                accent: {
                    button_text_color: "#ffffff",
                    button_color: "#222222",
                    button_radius: "30",
                    link_color: "#000000",
                    icons_color: "#3c5e89"
                },
                status: true
            },
            advanced: {
                section: {
                    background_color: "#ffffff",
                    card_border_color: "#e5e5e5",
                    card_border_width: "1",
                    border_radius: "20",
                    progress_bar_fill: "#000000",
                    progress_bar_background: "#e5e5e5"
                },
                input: {
                    input_color: "#dddddd",
                    input_border_radius: "8"
                },
                status: true
            }
        },
        storefront_app: {
            header: {
                header_bar_text: "Welcome !",
                header_text: "Close to the Sun",
                header_content: "Earn points, save, and unlock exclusive perks",
                balance_text: "Your balance",
                status: true
            },
            new_member_card: {
                image: "",
                image_position: "full-width",
                translations: {
                    title: "Join and Earn Rewards",
                    message: "Unlock exciting perks, this is your all access to exclusive rewards",
                    button_text: "Start Earning",
                    signin_msg: "Already have an account?",
                    signin_text: "Sign in"
                },
                status: true
            },
            points_card: {
                title: "Earn points",
                message: "Earn points and turn these into rewards!",
                ways_to_earn_text: "Ways to earn",
                ways_to_redeem_text: "Ways to redeem",
                my_rewards: "My Rewards",
                status: true
            },
            referrals_card: {
                title: "Referral Program",
                message: "Refer a friend who makes a purchase and both of you will claim perks!",
                rewards: {
                    referrer_text: "You get",
                    referrer_reward_text: "{reward_title}",
                    referee_text: "Your friend gets",
                    referee_reward_text: "{reward_title}",
                    link_box_title: "Your link"
                },
                status: true
            },
            vip_tiers_card: {
                title: "VIP Tiers",
                message: "Gain access to exclusive rewards.",
                button_text: "Join now",
                customer_tier: {
                    current_tier: "Current Tier",
                    next_tier: "points left to reach",
                    max_tier: "You achieved the highest tier"
                },
                all_tiers: {
                    title: "All tiers",
                    multiplier_text: "{ tier_multiplier }x points multiplier",
                    earn_points: "Earn { points } points",
                    benefits: "Benefits"
                },
                status: true
            },
            customer_reward_card: {
                current_reward: "Next reward",
                next_reward: "Next reward",
                rewards_available: "You have { count } rewards available",
                claim_text: "Claim",
                status: true
            }
        },
        launcher: {
            layout: {
                position: "bubble_left",
                icon: 1,
                title: "Rewards"
            },
            appearance: {
                text_color: "#ffffff",
                background_type: "solid",
                solid: "#3c56e9",
                gradient: {
                    color1: "#3c56e9",
                    color2: "#2035a7"
                },
                border_radius: "12",
                side_spacing: "30",
                bottom_spacing: "30"
            },
            accessibility: {
                visible_on: "all"
            },
            status: true
        }
    });

    return (
        <Page
            backAction={{ content: 'Back', onAction: () => navigate('/onsite') }}
            title={
                <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                    <Text as="h1" variant='headingLg'>Loyalty widget</Text>
                    <Badge tone={isEnabled ? 'success' : 'critical'}>
                        {isEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                </Box>
            }
            primaryAction={
                isEnabled && <Button onClick={handleToggle} tone={isEnabled ? 'critical' : ''}>
                    {isEnabled ? 'Disable' : ''}
                </Button>
            }
            subtitle='A floating bubble customers can use to interact with your loyalty program'
        >

            {!isEnabled && (
                <Box style={{ marginBottom: '30px' }}>
                    <Banner
                        title={'Widget is disabled'}
                        action={{ content: 'Enable', onAction: handleToggle }}
                        tone='warning'
                    >
                        <p>You can still make changes, but it won't be visible to customers until you enable it.</p>
                    </Banner>
                </Box>
            )}

            <Tabs
                tabs={tabs}
                selected={selectedTab}
                onSelect={(index) => setSelectedTab(index)}
            >
                <Box paddingBlockStart="300">
                    {selectedTab === 0 && (
                        <General widgetData={widgetData} setWidgetData={setWidgetData} />
                    )}
                    {selectedTab === 1 && (
                        <StoreFront widgetData={widgetData} setWidgetData={setWidgetData} />
                    )}
                    {selectedTab === 2 && (
                        <Launcher widgetData={widgetData} setWidgetData={setWidgetData} />
                    )}
                </Box>
            </Tabs>

        </Page >
    )
}

export default Widget
