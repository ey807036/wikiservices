import { defineMcp } from "@lovable.dev/mcp-js";
import listProducts from "./tools/list-products";
import getProduct from "./tools/get-product";
import listFiaCategories from "./tools/list-fia-categories";
import listFiaMcqs from "./tools/list-fia-mcqs";
import siteInfo from "./tools/site-info";

export default defineMcp({
  name: "wikiservices-mcp",
  title: "Wikiservices MCP",
  version: "0.1.0",
  instructions:
    "Wikiservices (wikiservices.online) is a Pakistani e-commerce site for jammers, hacking devices, and gadgets, plus FIA exam preparation MCQs. Use site_info for site overview and shopping recommendations, list_products/get_product to browse and share product links, and list_fia_categories/list_fia_mcqs to fetch FIA MCQs by subject. All product URLs must be shared verbatim so the user can buy on the site.",
  tools: [siteInfo, listProducts, getProduct, listFiaCategories, listFiaMcqs],
});
