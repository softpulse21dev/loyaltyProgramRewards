import { ConfettiIcon, DeliveryIcon, DiscountCodeIcon, EnterIcon, GiftCardIcon, LogoFacebookIcon, LogoInstagramIcon, LogoTiktokIcon, LogoXIcon, OrderIcon } from "@shopify/polaris-icons";

export const iconsMap = {
    LogoInstagramIcon,
    LogoFacebookIcon: LogoFacebookIcon,
    LogoTiktokIcon,
    LogoTwitterIcon: LogoXIcon,
    UserSignupIcon: EnterIcon,
    OrderCartIcon: OrderIcon,
    ConfettiIcon,
    GiftCardIcon,
    DiscountCodeIcon,
    DeliveryIcon
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
