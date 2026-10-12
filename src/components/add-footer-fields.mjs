// Run from your project root:  node add-footer-fields.mjs
// Adds a "Footer" tab to customtypes/site_settings/index.json. Safe to run twice.
import fs from "node:fs";

const file = "customtypes/site_settings/index.json";
const model = JSON.parse(fs.readFileSync(file, "utf8"));

const text = (label, placeholder = "") => ({ type: "Text", config: { label, placeholder } });
const image = (label) => ({ type: "Image", config: { label, constraint: {}, thumbnails: [] } });
const link = (label, allowText = true) => ({
    type: "Link",
    config: { label, placeholder: "", select: null, allowTargetBlank: true, allowText, repeat: false },
});
const group = (label, fields) => ({ type: "Group", config: { label, repeat: true, fields } });

model.json.Footer = {
    footer_kbkg_logo: image("KBKG Logo"),
    footer_tagline: text("Tagline"),
    footer_rights: text("Rights text (after the © year)", "all rights reserved"),
    footer_contact_title: text("Contact Title"),
    footer_contacts: group("Contact Lines", { text: text("Text"), email: text("Email") }),
    footer_note: text("Support Note"),
    footer_affiliate_link: link("Affiliate Link"),
    footer_social: group("Social Links", {
        network: {
            type: "Select",
            config: { label: "Network", placeholder: "", options: ["Instagram", "Facebook", "LinkedIn", "X", "YouTube", "Email"], default_value: "Instagram" },
        },
        link: link("Link", false),
    }),
    footer_legal_links: group("Legal Links", { link: link("Link") }),
    footer_news_title: text("News Title"),
    footer_read_more_label: text("Read More Label"),
    footer_software_title: text("Software Title"),
    footer_software_links: group("Software Links", { link: link("Link") }),
    footer_stay_title: text("Stay Connected Title"),
    footer_stay_links: group("Stay Connected Links", { link: link("Link") }),
};

fs.writeFileSync(file, JSON.stringify(model, null, 2) + "\n");
console.log("Footer tab added to " + file);