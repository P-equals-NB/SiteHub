/*
 * ==========================================
 * SITEHUB - SUPABASE CONFIGURATION
 * ==========================================
 *
 * Replace these two values with:
 * Supabase Dashboard
 * -> Project Settings
 * -> API
 *
 * IMPORTANT:
 * Use the "Publishable key" / anon key.
 * NEVER put a Supabase service_role key here.
 */

const SUPABASE_URL = "https://tjnihaiduhaibpchaffb.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_buDOCX8avygId4LUddmsnw_VyFwQb-V";


/* ==========================================
 * SUPABASE CLIENT
 * ========================================== */

const { createClient } = window.supabase;

const db = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


/* ==========================================
 * DOM
 * ========================================== */

const siteGrid = document.getElementById("siteGrid");
const emptyState = document.getElementById("emptyState");
const siteCount = document.getElementById("siteCount");

const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");

const modalOverlay = document.getElementById("modalOverlay");
const openModal = document.getElementById("openModal");
const closeModal = document.getElementById("closeModal");

const siteForm = document.getElementById("siteForm");
const submitBtn = document.getElementById("submitBtn");
const formMessage = document.getElementById("formMessage");

let activeCategory = "all";
let allSites = [];


/* ==========================================
 * INITIAL LOAD
 * ========================================== */

document.addEventListener("DOMContentLoaded", async () => {

    if (
        SUPABASE_URL === "YOUR_SUPABASE_URL" ||
        SUPABASE_ANON_KEY === "YOUR_SUPABASE_ANON_KEY"
    ) {
        showSetupMessage();
        return;
    }

    await loadSites();

});


/* ==========================================
 * LOAD SITES
 * ========================================== */

async function loadSites() {

    siteCount.textContent = "Loading...";

    const { data, error } = await db
        .from("sites")
        .select("*")
        .order("created_at", {
            ascending: false
        });

    if (error) {

        console.error(error);

        siteCount.textContent = "Could not load sites.";

        siteGrid.innerHTML = `
            <div class="empty-state" style="display:block; grid-column:1/-1;">
                <h2>Unable to load sites</h2>
                <p>Check your Supabase configuration and RLS policies.</p>
            </div>
        `;

        return;
    }

    allSites = data || [];

    renderSites();
}


/* ==========================================
 * RENDER
 * ========================================== */

function renderSites() {

    let sites = [...allSites];

    const search =
        searchInput.value
            .trim()
            .toLowerCase();


    /* SEARCH */

    if (search) {

        sites = sites.filter(site => {

            return (
                site.name.toLowerCase().includes(search) ||
                site.description.toLowerCase().includes(search) ||
                site.author_name.toLowerCase().includes(search) ||
                site.category.toLowerCase().includes(search)
            );

        });

    }


    /* CATEGORY */

    if (activeCategory !== "all") {

        sites = sites.filter(
            site =>
                site.category === activeCategory
        );

    }


    /* SORT */

    switch (sortSelect.value) {

        case "newest":

            sites.sort(
                (a, b) =>
                    new Date(b.created_at) -
                    new Date(a.created_at)
            );

            break;


        case "views":

            sites.sort(
                (a, b) =>
                    b.views - a.views
            );

            break;


        case "stars":

            sites.sort(
                (a, b) =>
                    b.stars - a.stars
            );

            break;


        case "az":

            sites.sort(
                (a, b) =>
                    a.name.localeCompare(b.name)
            );

            break;

    }


    /* COUNT */

    siteCount.textContent =
        `${sites.length} ${
            sites.length === 1
                ? "site"
                : "sites"
        }`;


    /* EMPTY */

    if (!sites.length) {

        siteGrid.innerHTML = "";

        emptyState.classList.remove(
            "hidden"
        );

        return;

    }

    emptyState.classList.add(
        "hidden"
    );


    siteGrid.innerHTML =
        sites
            .map(createSiteCard)
            .join("");

}


/* ==========================================
 * CARD
 * ========================================== */

function createSiteCard(site) {

    const firstLetter =
        site.name
            .charAt(0)
            .toUpperCase();

    const category =
        site.category
            .charAt(0)
            .toUpperCase() +
        site.category.slice(1);

    const hasStarred =
        hasStarredLocally(site.id);


    return `
        <article class="site-card">

            <div class="card-top">

                <div class="site-icon">
                    ${escapeHTML(firstLetter)}
                </div>

                <div class="card-actions">

                    <button
                        class="icon-btn star-btn ${
                            hasStarred
                                ? "starred"
                                : ""
                        }"
                        onclick="starSite('${site.id}')"
                        title="${
                            hasStarred
                                ? "Remove star"
                                : "Star site"
                        }"
                    >
                        ${
                            hasStarred
                                ? "★"
                                : "☆"
                        }
                    </button>

                </div>

            </div>


            <h3 class="site-title">
                ${escapeHTML(site.name)}
            </h3>


            <div class="site-url">
                ${escapeHTML(site.url)}
            </div>


            <p class="site-description">
                ${escapeHTML(site.description)}
            </p>


            <div class="site-author">
                Added by
                <strong>
                    ${escapeHTML(site.author_name)}
                </strong>
            </div>


            <div class="card-bottom">

                <span class="site-category">
                    ${escapeHTML(category)}
                </span>

                <div class="stats">

                    <span>
                        ${site.views} views
                    </span>

                    <span>
                        ★ ${site.stars}
                    </span>

                </div>

            </div>


            <button
                class="visit-btn"
                onclick="visitSite('${site.id}')"
            >
                Visit Site
            </button>

        </article>
    `;

}


/* ==========================================
 * VISIT
 * ========================================== */

async function visitSite(id) {

    const site =
        allSites.find(
            site => site.id === id
        );

    if (!site) return;


    /*
     * Optimistic local update.
     * The page immediately shows the
     * increased view count.
     */

    site.views++;

    renderSites();


    /*
     * Update Supabase.
     *
     * This is deliberately simple for an
     * anonymous project. For extremely high
     * traffic, views would ideally use a
     * server-side RPC instead.
     */

    const { error } = await db
        .from("sites")
        .update({
            views: site.views
        })
        .eq("id", id);


    if (error) {

        console.error(
            "Failed to update view count:",
            error
        );

    }


    window.open(
        site.url,
        "_blank",
        "noopener,noreferrer"
    );

}


/* ==========================================
 * STAR
 * ========================================== */

async function starSite(id) {

    const site =
        allSites.find(
            site => site.id === id
        );

    if (!site) return;


    const alreadyStarred =
        hasStarredLocally(id);


    if (alreadyStarred) {

        /*
         * Remove local star
         */

        site.stars =
            Math.max(
                0,
                site.stars - 1
            );

        removeLocalStar(id);

    } else {

        /*
         * Add star
         */

        site.stars++;

        addLocalStar(id);

    }


    renderSites();


    const { error } =
        await db
            .from("sites")
            .update({
                stars: site.stars
            })
            .eq("id", id);


    if (error) {

        console.error(
            "Failed to update star count:",
            error
        );

    }

}


/* ==========================================
 * LOCAL STAR TRACKING
 * ========================================== */

function getLocalStars() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "sitehub_starred"
            )
        ) || [];

    } catch {

        return [];

    }

}


function hasStarredLocally(id) {

    return getLocalStars().includes(id);

}


function addLocalStar(id) {

    const stars =
        getLocalStars();

    if (!stars.includes(id)) {

        stars.push(id);

        localStorage.setItem(
            "sitehub_starred",
            JSON.stringify(stars)
        );

    }

}


function removeLocalStar(id) {

    const stars =
        getLocalStars()
            .filter(
                starId =>
                    starId !== id
            );

    localStorage.setItem(
        "sitehub_starred",
        JSON.stringify(stars)
    );

}


/* ==========================================
 * ADD SITE
 * ========================================== */

siteForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        clearFormMessage();


        const authorName =
            document
                .getElementById("authorName")
                .value
                .trim();

        const name =
            document
                .getElementById("siteName")
                .value
                .trim();

        const url =
            document
                .getElementById("siteUrl")
                .value
                .trim();

        const description =
            document
                .getElementById("siteDescription")
                .value
                .trim();

        const category =
            document
                .getElementById("siteCategory")
                .value;


        if (
            !authorName ||
            !name ||
            !url ||
            !description
        ) {

            showFormMessage(
                "Please fill in every field.",
                "error"
            );

            return;

        }


        /*
         * Basic URL validation.
         */

        try {

            const parsed =
                new URL(url);

            if (
                parsed.protocol !== "http:" &&
                parsed.protocol !== "https:"
            ) {
                throw new Error();
            }

        } catch {

            showFormMessage(
                "Please enter a valid website URL.",
                "error"
            );

            return;

        }


        /*
         * Prevent exact duplicate URLs.
         */

        const duplicate =
            allSites.some(
                site =>
                    normalizeUrl(site.url) ===
                    normalizeUrl(url)
            );


        if (duplicate) {

            showFormMessage(
                "That website is already in the hub.",
                "error"
            );

            return;

        }


        submitBtn.disabled = true;

        submitBtn.textContent =
            "Adding...";


        const { data, error } =
            await db
                .from("sites")
                .insert({
                    name,
                    url,
                    description,
                    author_name: authorName,
                    category,
                    stars: 0,
                    views: 0
                })
                .select()
                .single();


        submitBtn.disabled = false;

        submitBtn.textContent =
            "Add Site";


        if (error) {

            console.error(error);

            showFormMessage(
                "Could not add the site. Please try again.",
                "error"
            );

            return;

        }


        allSites.unshift(data);

        siteForm.reset();

        showFormMessage(
            "Site added successfully.",
            "success"
        );


        setTimeout(() => {

            closeSiteModal();

            clearFormMessage();

        }, 600);


        renderSites();

    }
);


/* ==========================================
 * MODAL
 * ========================================== */

openModal.addEventListener(
    "click",
    () => {

        modalOverlay.classList.remove(
            "hidden"
        );

        document
            .getElementById("authorName")
            .focus();

    }
);


closeModal.addEventListener(
    "click",
    closeSiteModal
);


modalOverlay.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            modalOverlay
        ) {

            closeSiteModal();

        }

    }
);


function closeSiteModal() {

    modalOverlay.classList.add(
        "hidden"
    );

}


/* ==========================================
 * CATEGORY FILTER
 * ========================================== */

document
    .querySelectorAll(".category")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(".category")
                    .forEach(
                        button =>
                            button.classList.remove(
                                "active"
                            )
                    );


                button.classList.add(
                    "active"
                );


                activeCategory =
                    button.dataset.category;


                renderSites();

            }
        );

    });


/* ==========================================
 * SEARCH + SORT
 * ========================================== */

searchInput.addEventListener(
    "input",
    renderSites
);


sortSelect.addEventListener(
    "change",
    renderSites
);


/* ==========================================
 * HELPERS
 * ========================================== */

function normalizeUrl(url) {

    return url
        .trim()
        .replace(/\/+$/, "")
        .toLowerCase();

}


function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        String(value);

    return div.innerHTML;

}


function showFormMessage(
    message,
    type
) {

    formMessage.textContent =
        message;

    formMessage.className =
        `form-message ${type}`;

}


function clearFormMessage() {

    formMessage.textContent = "";

    formMessage.className =
        "form-message";

}


function showSetupMessage() {

    siteCount.textContent =
        "Setup required";

    siteGrid.innerHTML = `
        <div
            class="empty-state"
            style="display:block; grid-column:1/-1;"
        >
            <h2>Connect Supabase</h2>

            <p>
                Open script.js and replace
                YOUR_SUPABASE_URL and
                YOUR_SUPABASE_ANON_KEY.
            </p>
        </div>
    `;

}
