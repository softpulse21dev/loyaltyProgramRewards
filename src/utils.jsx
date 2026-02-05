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

export const cleanStrictWhitespace = (value = "") => {
    return String(value)
        .replace(/\s+/g, "")               // remove all whitespace
        .replace(/[^a-zA-Z0-9_-]/g, "")    // allow A–Z, 0–9, - and _
        .toUpperCase()
        .slice(0, 8);                      // max 8 characters
};

// Helper functions to convert between Hex and HSB
export const hexToHsb = (hex) => {
    // Remove # if present 
    hex = hex.replace('#', '');

    // Parse hex to RGB
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let h = 0;
    let s = max === 0 ? 0 : delta / max;
    let v = max;

    if (delta !== 0) {
        if (max === r) {
            h = ((g - b) / delta) % 6;
        } else if (max === g) {
            h = (b - r) / delta + 2;
        } else {
            h = (r - g) / delta + 4;
        }
        h = Math.round(h * 60);
        if (h < 0) h += 360;
    }

    return { hue: h, saturation: s, brightness: v };
};

export const hsbToHex = (hsb) => {
    const { hue, saturation, brightness } = hsb;
    const h = hue / 60;
    const c = brightness * saturation;
    const x = c * (1 - Math.abs(h % 2 - 1));
    const m = brightness - c;

    let r = 0, g = 0, b = 0;

    if (h >= 0 && h < 1) { r = c; g = x; b = 0; }
    else if (h >= 1 && h < 2) { r = x; g = c; b = 0; }
    else if (h >= 2 && h < 3) { r = 0; g = c; b = x; }
    else if (h >= 3 && h < 4) { r = 0; g = x; b = c; }
    else if (h >= 4 && h < 5) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }

    const toHex = (val) => {
        const hex = Math.round((val + m) * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export const darkenColor = (hex, amount = 0.3) => {
    let color = hex?.replace('#', '');

    if (color?.length === 3) {
        color = color.split('').map(c => c + c).join('');
    }

    const num = parseInt(color, 16);

    let r = (num >> 16) & 255;
    let g = (num >> 8) & 255;
    let b = num & 255;

    r = Math.floor(r * (1 - amount));
    g = Math.floor(g * (1 - amount));
    b = Math.floor(b * (1 - amount));

    return `rgb(${r}, ${g}, ${b})`;
};

export const NoLeadingZero = (value) => {
    if (!value) return "";
    let sanitized = value.replace(/[^0-9]/g, '');
    // Remove all leading zeros
    sanitized = sanitized.replace(/^0+/, '');
    return sanitized;
};

export const SingleLeadingZero = (value) => {
    if (!value) return "";
    let sanitized = value.replace(/[^0-9]/g, '');
    // If value has more than one digit, remove leading zeros
    if (sanitized.length > 1) {
        sanitized = sanitized.replace(/^0+/, '');
    }
    return sanitized;
};

export const sanitizeNumberWithDecimal = (value) => {
    if (!value) return "";
    // Remove everything except digits and dot
    let sanitized = value.replace(/[^0-9.]/g, '');
    // Allow only one dot
    const parts = sanitized.split('.');
    if (parts.length > 2) {
        sanitized = parts[0] + '.' + parts.slice(1).join('');
    }
    // Remove leading zeros unless before decimal
    sanitized = sanitized.replace(/^0+(?=\d)/, '');
    // Limit to 2 decimal places
    if (sanitized.includes('.')) {
        const [intPart, decPart] = sanitized.split('.');
        sanitized = intPart + '.' + decPart.slice(0, 2);
    }
    return sanitized;
};


export const FormatAddress = (...parts) => {
    return parts.filter(Boolean).join(', ');
};

export function FormatPlaceholder(input) {
    const [key, value] = input.split(":");

    return (
        <div>
            <div style={{ fontWeight: "600" }}>{key.trim()} :</div>
            <div>{value.trim()}</div>
        </div>
    );
}


// https://docs.google.com/document/d/11SHYSidCKFvxceiOE4-DTzvc3UthlGxb2JsLCY6i5rc/edit?hl=en-GB&forcehl=1&tab=t.sxv4ttgt6n4c