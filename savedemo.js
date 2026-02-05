import {
    Banner,
    BlockStack,
    Card,
    Icon,
    InlineStack,
    Layout,
    LegacyTabs,
    Link,
    Page,
    Select,
    SkeletonBodyText,
    SkeletonDisplayText,
    SkeletonTabs,
    SkeletonThumbnail,
    Text,
} from "@shopify/polaris";
import React, { useCallback, useEffect, useState } from "react";
import { fetchData, getApiURL } from "../action";
import Preloader from "../component/Preloader";
import Transition from "../component/Transition";
import Optimization from "../component/Optimization";
import { SaveBar } from "@shopify/app-bridge-react";
import defaultLanguges from "../defaultLanguges.json";
import { PreviewComponent } from "../component";
import bannerImg from "../assets/Banner-1.1.png";
import { useApiData } from "../component/ApiDataProvider";
import { ChatIcon } from "@shopify/polaris-icons";

function Settings() {
    const {
        settings,
        setSettings,
        originalSettings,
        setOriginalSettings,
        languageData,
        languageList,
        isLoading,
        getApiData,
        normalizePages,
        setLanguageData,
        setLangCode,
        langCode,
    } = useApiData();
    const [selected, setSelected] = useState(0);
    const [loding, setLoading] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [appStatus, setAppStatus] = useState(null);
    const [pageError, setPageError] = useState(null);
    const [imageError, setImageError] = useState("");
    const [soundError, setSounderror] = useState("");
    const [isApiCall, setIsApiCall] = useState(false);

    const handleTabChange = useCallback((selectedTabIndex) => {
        setSelected(selectedTabIndex);
        setPageError(null);
        setImageError(null);
        setSounderror(null);
    }, []);

    useEffect(() => {
        if (isDirty) {
            shopify.saveBar.show("settings-save-bar");
        } else {
            shopify.saveBar.hide("settings-save-bar");
        }
    }, [isDirty]);

    useEffect(() => {
        if (!originalSettings) return;
        const hasChanges =
            JSON.stringify(settings) !== JSON.stringify(originalSettings);
        setIsDirty(hasChanges);
    }, [settings, originalSettings]);

    const tabs = [
        { id: "preloader", content: languageData?.preloader },
        { id: "transition", content: languageData?.transition },
        { id: "optimization", content: languageData?.optimization },
    ];

    const appStatusData = async () => {
        const response = await fetchData(getApiURL("app-status"));
        if (response.status === true) {
            setAppStatus(response);
        }
    };

    useEffect(() => {
        appStatusData();
    }, []);

    const validatePages = () => {
        if (settings?.pl_page_type === "select") {
            let selected = settings?.pl_selected_pages;

            if (typeof selected === "string") {
                selected = selected
                    .replace(/[\[\]"]/g, "")
                    .split(",")
                    .filter((i) => i.trim() !== "");
            }

            if (!selected || selected.length === 0) {
                const errorMessage =
                    languageData?.valid_page || "Please select at least one page.";

                setPageError(errorMessage);
                shopify.toast.show(errorMessage, {
                    duration: 2000,
                    isError: true,
                });

                return false;
            }
        }

        if (settings?.pl_default === "no_loader") {
            if (
                !settings?.pl_selected_img_url ||
                settings?.pl_selected_img_url === ""
            ) {
                const errorMessage =
                    languageData?.please_upload_image ||
                    "Please upload your custom loader image";
                setImageError(errorMessage);
                shopify.toast.show(errorMessage, {
                    duration: 2000,
                    isError: true,
                });

                return false;
            }
        }

        console.log(
            "settings?.pl_transitions_cus_sound",
            settings?.pl_transitions_cus_sound
        );

        if (settings?.pl_transitions_sound === "custom") {
            if (
                !settings?.pl_transitions_cus_sound ||
                settings?.pl_transitions_cus_sound === ""
            ) {
                const errorMessage =
                    languageData?.please_upload_sound ||
                    "Please upload your custom sound.";
                setSounderror(errorMessage);
                shopify.toast.show(errorMessage, {
                    duration: 2000,
                    isError: true,
                });

                return false;
            }
        }

        setSounderror(null);
        setImageError(null);
        setPageError(null);
        return true;
    };

    const handleSave = async () => {
        if (!validatePages()) return;
        setLoading(true);
        const formData = new FormData();
        Object.keys(settings).forEach((key) => {
            if (key === "pl_selected_pages") {
                formData.append(
                    "pl_selected_pages",
                    JSON.stringify(settings.pl_selected_pages)
                );
            } else {
                formData.append(key, settings[key]);
            }
        });
        try {
            const response = await fetchData(getApiURL("save-settings"), formData);
            if (response.status === true) {
                setIsDirty(false);
                setSettings(response.data);
                setOriginalSettings(response.data);
                setLanguageData(response.lang_list);
                shopify.toast.show(response.message, {
                    duration: 2000,
                });
            } else {
                shopify.toast.show(response.message, {
                    duration: 2000,
                    isError: true,
                });
            }
        } catch (error) {
            shopify.toast.show(error, {
                duration: 2000,
                isError: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDiscard = () => {
        setSettings(originalSettings);
        setIsDirty(false);
        shopify.toast.show(languageData?.discard_msg || "Changes discarded", {
            duration: 2000,
        });
        shopify.saveBar.hide("settings-save-bar");
    };

    return isLoading || isApiCall ? (
        <Page title={languageData?.settings}>
            <Layout>
                <Layout.Section>
                    <Card>
                        <div style={{ display: "flex", gap: "50px" }}>
                            <SkeletonBodyText />
                            <SkeletonThumbnail size="large" />
                        </div>
                    </Card>
                </Layout.Section>
                <Layout.Section>
                    <BlockStack gap={300}>
                        <SkeletonTabs count={3}></SkeletonTabs>
                        <Layout>
                            <Layout.Section>
                                <Card>
                                    <BlockStack gap={400}>
                                        <SkeletonBodyText lines={3} />
                                        <SkeletonThumbnail size="large" />
                                        <SkeletonBodyText lines={4} />
                                    </BlockStack>
                                </Card>
                            </Layout.Section>{" "}
                            <Layout.Section variant="oneThird">
                                <Card>
                                    <BlockStack gap={300}>
                                        <SkeletonDisplayText />
                                        <SkeletonThumbnail size="large" />
                                    </BlockStack>
                                </Card>
                            </Layout.Section>
                        </Layout>
                    </BlockStack>
                </Layout.Section>
            </Layout>
        </Page>
    ) : (
        <Page
            title={languageData?.settings}
        // primaryAction={{ content: "Save", onAction: handleSave }}
        >
            <SaveBar id="settings-save-bar" discardConfirmation>
                <button
                    variant="primary"
                    {...(loding ? { loading: "true" } : {})}
                    onClick={async () => {
                        await handleSave();
                        setIsDirty(false);
                        shopify.saveBar.hide("settings-save-bar");
                    }}
                >
                    {languageData?.save}
                </button>
                <button onClick={handleDiscard}>{languageData?.discard}</button>
            </SaveBar>
            <Layout>
                {appStatus?.extension_banner?.status === true && (
                    <Layout.Section>
                        <Banner
                            title={languageData?.app_banner_title}
                            tone="warning"
                            action={{
                                content: languageData?.activate,
                                url: appStatus?.extension_banner?.button?.link,
                                target: "_blank",
                            }}
                        >
                            <p>{languageData?.app_banner_desc}</p>
                        </Banner>
                    </Layout.Section>
                )}
                <Layout.Section>
                    <Card>
                        <InlineStack align="space-between" wrap={false} gap={300}>
                            <BlockStack gap={400}>
                                <Text variant="headingMd">{languageData?.banner_heading}</Text>
                                <BlockStack gap={200}>
                                    <Text variant="bodyMd">{languageData?.banner_desc_1}</Text>
                                </BlockStack>
                            </BlockStack>
                            <img
                                alt="banner"
                                style={{
                                    objectFit: "cover",
                                    objectPosition: "center",
                                }}
                                src={bannerImg}
                            />
                        </InlineStack>
                    </Card>
                </Layout.Section>
                <Layout.Section>
                    <Layout>
                        <Layout.Section>
                            <div
                                className="Polaris-InlineStack"
                                style={{
                                    "--pc-inline-stack-wrap": "wrap",
                                    "--pc-inline-stack-flex-direction-xs": "row",
                                    "--pc-inline-stack-align": "space-between",
                                    alignItems: "center",
                                }}
                            >
                                <LegacyTabs
                                    tabs={tabs}
                                    selected={selected}
                                    onSelect={handleTabChange}
                                ></LegacyTabs>
                                <Select
                                    label={languageData?.label_lang}
                                    options={languageList.map((val) => ({
                                        label: val.label,
                                        value: val.code,
                                    }))}
                                    labelInline
                                    value={langCode}
                                    onChange={async (value) => {
                                        setLangCode(value);
                                        setIsApiCall(true);
                                        const langForm = new FormData();
                                        langForm.append("lang", value);
                                        const response = await fetchData(
                                            getApiURL("lang-change"),
                                            langForm
                                        );
                                        if (response.status === true) {
                                            setLanguageData(response.language);
                                            setIsApiCall(false);
                                            shopify.toast.show(response.message, {
                                                duration: 2000,
                                            });
                                        }
                                    }}
                                />
                            </div>
                        </Layout.Section>
                        <Layout.Section>
                            {selected === 0 && (
                                <Preloader
                                    settings={settings}
                                    setSettings={setSettings}
                                    setIsDirty={setIsDirty}
                                    languageData={languageData}
                                    pageError={pageError}
                                    imageError={imageError}
                                />
                            )}
                            {selected === 1 && (
                                <Transition
                                    settings={settings}
                                    setSettings={setSettings}
                                    setIsDirty={setIsDirty}
                                    languageData={languageData}
                                    soundError={soundError}
                                />
                            )}
                            {selected === 2 && (
                                <Optimization
                                    settings={settings}
                                    setSettings={setSettings}
                                    setIsDirty={setIsDirty}
                                    languageData={languageData}
                                />
                            )}
                        </Layout.Section>
                        <div
                            class="Polaris-Layout__Section Polaris-Layout__Section--oneThird"
                            style={{
                                position: "sticky",
                                top: "10px",
                            }}
                        >
                            <Card>
                                <BlockStack gap={200}>
                                    <Text variant="headingSm" as="h6">
                                        {languageData?.preview}
                                    </Text>
                                    <Text>{languageData?.prev_desc}</Text>
                                    <div
                                        class="Polaris-ShadowBevel"
                                        style={{
                                            "--pc-shadow-bevel-z-index": 32,
                                            "--pc-shadow-bevel-content-xs": "",
                                            "--pc-shadow-bevel-box-shadow-xs": "var(--p-shadow-100)",
                                            "--pc-shadow-bevel-border-radius-xs":
                                                "var(--p-border-radius-300)",
                                            border:
                                                "var(--p-border-width-025) solid var(--p-color-border-secondary)",
                                            minHeight: "235px",
                                        }}
                                    >
                                        <div
                                            class="Polaris-Box"
                                            style={{
                                                "--pc-box-background": "var(--p-color-bg-surface)",
                                                "--pc-box-min-height": "100%",
                                                "--pc-box-overflow-x": "clip",
                                                "--pc-box-overflow-y": "clip",
                                                "--pc-box-padding-block-start-xs": "var(--p-space-300)",
                                                "--pc-box-padding-block-end-xs": "var(--p-space-300)",
                                                "--pc-box-padding-inline-start-xs":
                                                    "var(--p-space-300)",
                                                "--pc-box-padding-inline-end-xs": "var(--p-space-300)",
                                            }}
                                        >
                                            <PreviewComponent settings={settings} />
                                        </div>
                                    </div>
                                </BlockStack>
                            </Card>
                        </div>
                    </Layout>
                </Layout.Section>{" "}
                <Layout.Section></Layout.Section>
                <Layout.Section></Layout.Section>
            </Layout>
        </Page>
    );
}

export default Settings;
