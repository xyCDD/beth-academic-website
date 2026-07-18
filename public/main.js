/* =========================================================================
   Beth Chen — Personal Academic Website
   Stage 5: presentation behaviour + database-driven ideas + one-way
   "I'm interested" interaction.

   Allowed here:
     - mobile nav toggle, close menu on link click, active-nav highlight
     - fetch GET /api/ideas and render the idea cards
     - POST one interest per idea (one-way), with saving / settled / error UI
     - a light localStorage guard against accidental repeat clicks
   Interest is intentionally ONE-WAY in the MVP: there is no unlike, toggle,
   undo, or decrement. The public count always comes from the database.
   NOT here yet: Stay in Touch email submission, any admin behaviour.
   ========================================================================= */
(function () {
  "use strict";

  /* ===================================================================
     1. Mobile navigation
     =================================================================== */
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("navMenu");

  function closeMenu() {
    if (!menu || !toggle) return;
    menu.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
  }
  function openMenu() {
    if (!menu || !toggle) return;
    menu.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close menu");
  }
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      if (menu.classList.contains("is-open")) { closeMenu(); } else { openMenu(); }
    });
    menu.addEventListener("click", function (event) {
      if (event.target.closest(".nav__link")) { closeMenu(); }
    });
  }

  /* ===================================================================
     2. Active-navigation highlight
     =================================================================== */
  var links = Array.prototype.slice.call(document.querySelectorAll(".nav__link"));
  var sections = links
    .map(function (link) {
      var id = link.getAttribute("href");
      return id && id.charAt(0) === "#" ? document.querySelector(id) : null;
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = "#" + entry.target.id;
          links.forEach(function (link) {
            link.classList.toggle("is-active", link.getAttribute("href") === id);
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach(function (section) { observer.observe(section); });
  }

  /* ===================================================================
     3. localStorage guard for the interest button
     A single key holds an array of numeric idea IDs this browser has
     already marked as interested. It is only a light guard against
     accidental repeats — not identity verification.
     =================================================================== */
  var STORAGE_KEY = "bethInterestedIdeaIds";

  function getInterestedIds() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      // keep only positive whole numbers
      return parsed.filter(function (n) {
        return typeof n === "number" && Number.isInteger(n) && n > 0;
      });
    } catch (e) {
      return [];
    }
  }

  function hasInterestedId(id) {
    return getInterestedIds().indexOf(id) !== -1;
  }

  function addInterestedId(id) {
    try {
      var ids = getInterestedIds();
      if (ids.indexOf(id) === -1) {
        ids.push(id);                 // add once; preserve existing IDs
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
      }
    } catch (e) {
      // If storage is unavailable, the interaction still worked in the
      // database; we simply cannot remember it in this browser.
    }
  }

  /* ===================================================================
     4. Load research ideas and render the cards
     =================================================================== */
  var ideaGrid = document.getElementById("ideaGrid");

  function interestWording(count) {
    if (!count || count <= 0) return "Be the first to show interest";
    if (count === 1) return "1 person is interested";
    return count + " people are interested";
  }

  function showStatus(message, isError) {
    if (!ideaGrid) return;
    ideaGrid.textContent = "";
    var p = document.createElement("p");
    p.className = isError ? "ideas__status ideas__status--error" : "ideas__status";
    p.setAttribute("data-ideas-status", "");
    p.textContent = message;
    ideaGrid.appendChild(p);
  }

  // Put a button into the settled, non-clickable "Interested" state.
  function setSettledState(button) {
    var icon = button.querySelector(".btn--interest__icon");
    var label = button.querySelector(".btn--interest__label");
    if (icon) icon.textContent = "♥";        // ♥ filled heart
    if (label) label.textContent = "Interested";
    button.setAttribute("aria-pressed", "true");
    button.classList.add("is-interested");
    button.disabled = true;                        // cannot be clicked again
  }

  // Reset a button back to the original clickable "I'm interested" state.
  function setDefaultState(button) {
    var icon = button.querySelector(".btn--interest__icon");
    var label = button.querySelector(".btn--interest__label");
    if (icon) icon.textContent = "♡";        // ♡ outline heart
    if (label) label.textContent = "I’m interested";
    button.setAttribute("aria-pressed", "false");
    button.classList.remove("is-interested");
    button.disabled = false;
  }

  function buildCard(idea) {
    var alreadyInterested = hasInterestedId(idea.id);

    var card = document.createElement("article");
    card.className = "idea-card";
    card.setAttribute("data-idea-key", idea.idea_key || "");
    card.setAttribute("data-idea-id", String(idea.id));

    var body = document.createElement("div");
    body.className = "idea-card__body";

    var status = document.createElement("span");
    status.className = "status-pill";
    status.setAttribute("data-field", "status");
    status.textContent = idea.status;
    body.appendChild(status);

    var title = document.createElement("h3");
    title.className = "idea-card__title";
    title.setAttribute("data-field", "title");
    title.textContent = idea.title;
    body.appendChild(title);

    var desc = document.createElement("p");
    desc.className = "idea-card__desc";
    desc.setAttribute("data-field", "description");
    desc.textContent = idea.description;
    body.appendChild(desc);

    var chips = document.createElement("ul");
    chips.className = "chips";
    chips.setAttribute("data-field", "keywords");
    chips.setAttribute("role", "list");
    (idea.keywords || []).forEach(function (keyword) {
      var chip = document.createElement("li");
      chip.className = "chip";
      chip.textContent = keyword;
      chips.appendChild(chip);
    });
    body.appendChild(chips);

    card.appendChild(body);

    var interest = document.createElement("div");
    interest.className = "idea-card__interest";

    var button = document.createElement("button");
    button.className = "btn btn--interest";
    button.type = "button";
    button.setAttribute("data-interest-button", "");

    var icon = document.createElement("span");
    icon.className = "btn--interest__icon";
    icon.setAttribute("aria-hidden", "true");
    button.appendChild(icon);

    var label = document.createElement("span");
    label.className = "btn--interest__label";
    button.appendChild(label);

    interest.appendChild(button);

    var count = document.createElement("p");
    count.className = "idea-card__count";
    count.setAttribute("data-interest-count", "");
    // The number ALWAYS comes from the database (idea.interest_count).
    count.textContent = interestWording(idea.interest_count);
    interest.appendChild(count);

    card.appendChild(interest);

    // Initial button state: settled if this browser already marked it,
    // otherwise the normal clickable default.
    if (alreadyInterested) {
      setSettledState(button);
    } else {
      setDefaultState(button);
    }

    return card;
  }

  function renderIdeas(ideas) {
    if (!ideaGrid) return;
    ideaGrid.textContent = "";
    if (!Array.isArray(ideas) || ideas.length === 0) {
      showStatus("No research ideas to show yet.", false);
      return;
    }
    var fragment = document.createDocumentFragment();
    ideas.forEach(function (idea) { fragment.appendChild(buildCard(idea)); });
    ideaGrid.appendChild(fragment);
  }

  function loadIdeas() {
    if (!ideaGrid) return;
    showStatus("Loading research ideas…", false);
    fetch("/api/ideas")
      .then(function (response) {
        if (!response.ok) throw new Error("Request failed: " + response.status);
        return response.json();
      })
      .then(renderIdeas)
      .catch(function (err) {
        console.error("Could not load research ideas:", err);
        showStatus(
          "Sorry, the research ideas could not be loaded. Please refresh the page to try again.",
          true
        );
      });
  }

  /* ===================================================================
     5. Handle interest clicks (event delegation on the grid)
     =================================================================== */
  function showCardError(interestBox, message) {
    var existing = interestBox.querySelector(".idea-card__error");
    if (existing) existing.remove();
    var err = document.createElement("p");
    err.className = "idea-card__error";
    err.setAttribute("role", "alert");
    err.textContent = message;
    interestBox.appendChild(err);
  }
  function clearCardError(interestBox) {
    var existing = interestBox.querySelector(".idea-card__error");
    if (existing) existing.remove();
  }

  if (ideaGrid) {
    ideaGrid.addEventListener("click", function (event) {
      var button = event.target.closest("[data-interest-button]");
      if (!button) return;

      // Guard: ignore clicks on a settled button or one already in flight.
      if (button.disabled || button.classList.contains("is-interested")) return;

      var card = button.closest(".idea-card");
      if (!card) return;
      var ideaId = Number(card.getAttribute("data-idea-id"));
      if (!Number.isInteger(ideaId) || ideaId <= 0) return;

      var interestBox = card.querySelector(".idea-card__interest");
      var countEl = card.querySelector("[data-interest-count]");
      var label = button.querySelector(".btn--interest__label");

      clearCardError(interestBox);

      // Immediately disable + show "Saving…" so a rapid double-click cannot
      // send two requests.
      var previousLabel = label ? label.textContent : "I’m interested";
      button.disabled = true;
      if (label) label.textContent = "Saving…";

      fetch("/api/ideas/" + ideaId + "/interest", { method: "POST" })
        .then(function (response) {
          if (!response.ok) throw new Error("Request failed: " + response.status);
          return response.json();
        })
        .then(function (data) {
          // Update the visible count from the DATABASE count in the response.
          if (countEl && data && typeof data.interest_count === "number") {
            countEl.textContent = interestWording(data.interest_count);
          }
          setSettledState(button);      // filled heart, "Interested", locked
          addInterestedId(ideaId);      // remember in this browser only
        })
        .catch(function (err) {
          console.error("Could not save interest:", err);
          // Restore the original clickable state; do NOT change the count,
          // do NOT store anything.
          if (label) label.textContent = previousLabel;
          button.disabled = false;
          setDefaultState(button);
          showCardError(interestBox, "Sorry, that didn’t save. Please try again.");
        });
    });
  }

  loadIdeas();

  /* ===================================================================
     6. Footer year
     =================================================================== */
  var yearEl = document.getElementById("year");
  if (yearEl) { yearEl.textContent = String(new Date().getFullYear()); }
})();
