import {
    Card,
    Layout,
    Button,
    ResourceList,
    ResourceItem,
    Text,
    Badge,
} from "@shopify/polaris";

export default function Referral() {

    const rewardRules = [
        { id: "1", title: "Sign up", status: "Active", points: "0 points" },
        {
            id: "2",
            title: "Subscribe to newsletter",
            status: "Inactive",
            points: "0 points",
        },
        { id: "3", title: "Place order", status: "Active", points: "View details" },
    ];

    return (
        <div className="annotatedSection-border">
            <Layout.AnnotatedSection
                title={'Earning rules'}
                description={'Create ways for customers to earn rewards on multiple actions such as sign-ups, placing an order, etc.'}
            >
                <Card title="Earning rules" sectioned>
                    <ResourceList
                        resourceName={{ singular: "rule", plural: "rules" }}
                        items={rewardRules}
                        renderItem={(item) => {
                            const { id, title, status, points } = item;
                            return (
                                <ResourceItem id={id}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <Text>{title}</Text>
                                        <Badge status={status === "Active" ? "success" : "attention"}>{status}</Badge>
                                        <Text>{points}</Text>
                                        <Button plain>Edit</Button>
                                    </div>
                                </ResourceItem>
                            );
                        }}
                    />
                </Card>
            </Layout.AnnotatedSection>
        </div>
    );
}
