(function () {
    const toggle = document.querySelector("[data-mobile-toggle]");
    const panel = document.querySelector("[data-mobile-panel]");

    if (toggle && panel) {
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function setupInlineFilter() {
        const list = document.querySelector("[data-filter-list]");
        const search = document.querySelector("[data-inline-search]");
        const year = document.querySelector("[data-filter-year]");
        const type = document.querySelector("[data-filter-type]");
        const reset = document.querySelector("[data-filter-reset]");
        const count = document.querySelector("[data-filter-count]");

        if (!list) {
            return;
        }

        const cards = Array.from(list.querySelectorAll("[data-filter-card]"));

        function applyFilter() {
            const query = normalize(search ? search.value : "");
            const yearValue = normalize(year ? year.value : "");
            const typeValue = normalize(type ? type.value : "");
            let visible = 0;

            cards.forEach(function (card) {
                const haystack = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.genre,
                    card.dataset.tags
                ].join(" "));
                const matchesQuery = !query || haystack.includes(query);
                const matchesYear = !yearValue || normalize(card.dataset.year) === yearValue;
                const matchesType = !typeValue || normalize(card.dataset.type) === typeValue;
                const show = matchesQuery && matchesYear && matchesType;
                card.hidden = !show;
                if (show) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = "当前显示 " + visible + " 部影片";
            }
        }

        if (search) {
            search.addEventListener("input", applyFilter);
        }
        if (year) {
            year.addEventListener("change", applyFilter);
        }
        if (type) {
            type.addEventListener("change", applyFilter);
        }
        if (reset) {
            reset.addEventListener("click", function () {
                if (search) {
                    search.value = "";
                }
                if (year) {
                    year.value = "";
                }
                if (type) {
                    type.value = "";
                }
                applyFilter();
            });
        }

        applyFilter();
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function renderSearchResults() {
        const results = document.getElementById("search-results");
        const summary = document.getElementById("search-summary");
        const input = document.getElementById("search-input");

        if (!results || !summary || !Array.isArray(window.SEARCH_MOVIES)) {
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const query = params.get("q") || "";
        if (input) {
            input.value = query;
        }

        const normalizedQuery = normalize(query);
        const matches = normalizedQuery
            ? window.SEARCH_MOVIES.filter(function (movie) {
                return normalize([
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    movie.tags,
                    movie.oneLine
                ].join(" ")).includes(normalizedQuery);
            })
            : window.SEARCH_MOVIES.slice(0, 80);

        summary.textContent = normalizedQuery
            ? "共找到 " + matches.length + " 部相关影片"
            : "请输入关键词，或先浏览下方推荐影片";

        results.innerHTML = matches.slice(0, 240).map(function (movie) {
            const tags = (movie.tags || []).slice(0, 3).map(function (tag) {
                return "<span>" + escapeHtml(tag) + "</span>";
            }).join("");
            return "<article class=\"movie-card\">" +
                "<a href=\"./" + escapeHtml(movie.file) + "\" aria-label=\"观看" + escapeHtml(movie.title) + "\">" +
                "<div class=\"movie-poster\">" +
                "<img src=\"./" + escapeHtml(movie.coverId) + ".jpg\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\" decoding=\"async\" width=\"360\" height=\"540\">" +
                "<span class=\"movie-year\">" + escapeHtml(movie.year) + "</span>" +
                "<span class=\"play-dot\">▶</span>" +
                "</div>" +
                "<div class=\"movie-info\">" +
                "<div class=\"movie-tags\">" + tags + "</div>" +
                "<h3>" + escapeHtml(movie.title) + "</h3>" +
                "<p>" + escapeHtml(movie.oneLine) + "</p>" +
                "<div class=\"movie-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
                "</div>" +
                "</a>" +
                "</article>";
        }).join("");
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupInlineFilter();
        renderSearchResults();
    });
})();
