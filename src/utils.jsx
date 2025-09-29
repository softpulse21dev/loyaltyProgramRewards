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

// https://docs.google.com/document/d/11SHYSidCKFvxceiOE4-DTzvc3UthlGxb2JsLCY6i5rc/edit?hl=en-GB&forcehl=1&tab=t.sxv4ttgt6n4c