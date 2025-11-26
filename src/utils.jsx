import { ArrowDiagonalIcon, ConfettiIcon, DeliveryIcon, DiscountCodeIcon, DiscountIcon, EnterIcon, GiftCardIcon, LogoFacebookIcon, LogoInstagramIcon, LogoTiktokIcon, LogoXIcon, MoneyIcon, OrderIcon, WalletIcon } from "@shopify/polaris-icons";

export const iconsMap = {
    LogoInstagramIcon,
    LogoFacebookIcon: LogoFacebookIcon,
    LogoTiktokIcon,
    LogoTwitterIcon: LogoXIcon,
    UserSignupIcon: EnterIcon,
    VisitURLIcon: ArrowDiagonalIcon,
    OrderCartIcon: OrderIcon,
    BirthdayCakeIcon: ConfettiIcon,
    DiscountCodeIcon,
    DeliveryIcon: DeliveryIcon,
    WalletPassIcon: WalletIcon,
    ConfettiIcon: ConfettiIcon,
    ShippingIcon: DeliveryIcon,
    GiftIcon: GiftCardIcon,
    DiscountIcon: DiscountIcon,
    EarnPointsIcon: MoneyIcon,
};

export const NavigateMap = {
    signup: "/loyaltyProgram/loyaltySignupView",
    social_share_twitter: "/loyaltyProgram/loyaltySocialView",
    social_share_facebook: "/loyaltyProgram/loyaltySocialView",
    social_follow_tiktok: "/loyaltyProgram/loyaltySocialView",
    social_follow_twitter: "/loyaltyProgram/loyaltySocialView",
    social_follow_instagram: "/loyaltyProgram/loyaltySocialView",
    custom: "/loyaltyProgram/loyaltySocialView",
    order: "/loyaltyProgram/orderPoints",
    loyalty_anniversary: "/loyaltyProgram/loyaltySignupView",
    url_visit: "/loyaltyProgram/loyaltySocialView",
    referral: "/loyaltyProgram/loyaltyReferralView",
    birthday: "/loyaltyProgram/loyaltySignupView",
    add_wallet: "/loyaltyProgram/loyaltySignupView",
}

export const formatShortDate = (dateString) => {
    // Return a placeholder if the date string is not valid
    if (!dateString) {
        return 'N/A';
    }
    // Array of short month names
    const monthAbbreviations = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    try {
        const date = new Date(dateString);
        // Check if the created date is valid
        if (isNaN(date.getTime())) {
            return dateString; // Return original string if it's an invalid date
        }
        const day = date.getDate();
        const monthIndex = date.getMonth(); // 0-indexed (Jan=0, Feb=1, etc.)
        const year = date.getFullYear();
        return `${day} ${monthAbbreviations[monthIndex]} ${year}`;
    } catch (error) {
        console.error("Error formatting date:", error);
        return dateString; // Fallback to original string on error
    }
};

export const capitalizeFirst = (str) => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export const openSocialShare = (platform, urlToShare) => {
    if (!urlToShare) return;

    // Encode the URL to ensure special characters don't break the link
    const encodedUrl = encodeURIComponent(urlToShare);
    let shareUrl = '';
    let windowName = 'Share';

    switch (platform) {
        case 'social_share_facebook':
        case 'facebook':
            // Facebook Sharer URL
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
            windowName = 'FacebookShare';
            break;

        case 'social_share_twitter':
        case 'twitter':
        case 'x':
            // X (Twitter) Intent URL
            shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodeURIComponent("Check this out!")}`;
            windowName = 'TwitterShare';
            break;

        case 'social_share_tiktok':
        case 'tiktok':
            // TIKTOK WARNING: 
            // TikTok DOES NOT support a web-based "Share Link" API like FB/Twitter.
            // You cannot open a window to "Post this link" on TikTok.
            // Best Practice: Copy link to clipboard and open TikTok home.
            navigator.clipboard.writeText(urlToShare);
            alert("Link copied! Open TikTok to paste it in your bio or message.");
            shareUrl = `https://www.tiktok.com/`;
            break;

        default:
            // Fallback: just open the link if platform is unknown
            shareUrl = urlToShare;
            break;
    }

    // Open a popup window instead of a new tab for better UX
    if (shareUrl) {
        window.open(shareUrl, windowName, 'width=600,height=500,scrollbars=yes,resizable=yes');
    }
};

// https://docs.google.com/document/d/11SHYSidCKFvxceiOE4-DTzvc3UthlGxb2JsLCY6i5rc/edit?hl=en-GB&forcehl=1&tab=t.sxv4ttgt6n4c