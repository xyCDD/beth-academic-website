/* =========================================================================
   dashboard.js — admin dashboard behaviour.
   Loads ideas + contacts from protected admin APIs, lets the admin change
   idea status/visibility and contact status, and delete contacts (with an
   inline confirm step). Uses textContent for all database text. If any admin
   API returns 401, the admin is sent back to the login page.
   ========================================================================= */
(function () {
  "use strict";

  var IDEA_STATUSES = ["Exploring", "Developing", "Paused"];
  var CONTACT_STATUSES = ["new", "contacted", "archived"];

  var ideasArea = document.getElementById("ideasArea");
  var contactsArea = document.getElementById("contactsArea");
  var logoutBtn = document.getElementById("logoutBtn");

  function goLogin() { window.location.replace("/admin/login"); }

  // Wrapper: parse JSON, and bounce to login on 401.
  function apiFetch(url, options) {
    return fetch(url, options).then(function (response) {
      if (response.status === 401) {
        goLogin();
        throw new Error("unauthenticated");
      }
      return response.json().then(function (data) {
        return { ok: response.ok, status: response.status, data: data };
      });
    });
  }

  function areaMessage(area, message, isError) {
    area.textContent = "";
    var p = document.createElement("p");
    p.className = isError ? "admin-status is-error" : "admin-status";
    p.textContent = message;
    area.appendChild(p);
  }

  function formatDate(iso) {
    try {
      var d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      return d.toLocaleString();
    } catch (e) {
      return iso;
    }
  }

  /* ---- Ideas --------------------------------------------------------- */
  function loadIdeas() {
    areaMessage(ideasArea, "Loading research ideas…", false);
    apiFetch("/api/admin/ideas")
      .then(function (res) {
        if (!res.ok) throw new Error("load");
        renderIdeas(res.data);
      })
      .catch(function (err) {
        if (err.message === "unauthenticated") return;
        areaMessage(ideasArea, "Could not load research ideas. Please refresh.", true);
      });
  }

  function renderIdeas(ideas) {
    ideasArea.textContent = "";
    if (!Array.isArray(ideas) || ideas.length === 0) {
      areaMessage(ideasArea, "No research ideas found.", false);
      return;
    }
    ideas.forEach(function (idea) { ideasArea.appendChild(buildIdeaCard(idea)); });
  }

  function buildIdeaCard(idea) {
    var currentPublic = idea.is_public;

    var card = document.createElement("article");
    card.className = "admin-card";
    card.setAttribute("data-idea-id", String(idea.id));

    var title = document.createElement("h3");
    title.className = "admin-card__title";
    title.textContent = idea.title;
    card.appendChild(title);

    var key = document.createElement("p");
    key.className = "admin-card__key";
    key.textContent = idea.idea_key;
    card.appendChild(key);

    var meta = document.createElement("p");
    meta.className = "admin-card__meta";
    var pill = document.createElement("span");
    pill.className = "pill " + (currentPublic ? "pill--public" : "pill--hidden");
    pill.textContent = currentPublic ? "Public" : "Hidden";
    meta.appendChild(pill);
    var counts = document.createElement("span");
    counts.textContent =
      "  ·  " + idea.interest_count + (idea.interest_count === 1 ? " interest" : " interests");
    meta.appendChild(counts);
    card.appendChild(meta);

    var controls = document.createElement("div");
    controls.className = "admin-controls";

    // Status select
    var statusControl = document.createElement("label");
    statusControl.className = "admin-control";
    var statusText = document.createElement("span");
    statusText.className = "admin-control__label";
    statusText.textContent = "Status";
    statusControl.appendChild(statusText);
    var select = document.createElement("select");
    select.className = "admin-select";
    IDEA_STATUSES.forEach(function (s) {
      var o = document.createElement("option");
      o.value = s;
      o.textContent = s;
      if (s === idea.status) o.selected = true;
      select.appendChild(o);
    });
    statusControl.appendChild(select);
    controls.appendChild(statusControl);

    // Visibility toggle
    var visBtn = document.createElement("button");
    visBtn.type = "button";
    visBtn.className = "btn btn--secondary";
    function setVisLabel(pub) { visBtn.textContent = pub ? "Hide from site" : "Show on site"; }
    setVisLabel(currentPublic);
    controls.appendChild(visBtn);

    card.appendChild(controls);

    var feedback = document.createElement("p");
    feedback.className = "admin-feedback";
    feedback.setAttribute("role", "status");
    card.appendChild(feedback);

    function patchIdea(update, successMsg) {
      select.disabled = true;
      visBtn.disabled = true;
      feedback.className = "admin-feedback";
      feedback.textContent = "Saving…";
      apiFetch("/api/admin/ideas/" + idea.id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(update),
      })
        .then(function (res) {
          if (!res.ok) throw new Error((res.data && res.data.error) || "save");
          currentPublic = res.data.is_public;
          setVisLabel(currentPublic);
          pill.className = "pill " + (currentPublic ? "pill--public" : "pill--hidden");
          pill.textContent = currentPublic ? "Public" : "Hidden";
          if (typeof res.data.status === "string") select.value = res.data.status;
          feedback.className = "admin-feedback is-success";
          feedback.textContent = successMsg;
        })
        .catch(function (err) {
          if (err.message === "unauthenticated") return;
          feedback.className = "admin-feedback is-error";
          feedback.textContent = "Could not save. Please try again.";
        })
        .then(function () {
          select.disabled = false;
          visBtn.disabled = false;
        });
    }

    select.addEventListener("change", function () {
      patchIdea({ status: select.value }, "Status updated.");
    });
    visBtn.addEventListener("click", function () {
      patchIdea({ is_public: !currentPublic }, "Visibility updated.");
    });

    return card;
  }

  /* ---- Contacts ------------------------------------------------------ */
  function loadContacts() {
    areaMessage(contactsArea, "Loading contact requests…", false);
    apiFetch("/api/admin/contacts")
      .then(function (res) {
        if (!res.ok) throw new Error("load");
        renderContacts(res.data);
      })
      .catch(function (err) {
        if (err.message === "unauthenticated") return;
        areaMessage(contactsArea, "Could not load contact requests. Please refresh.", true);
      });
  }

  function renderContacts(contacts) {
    contactsArea.textContent = "";
    if (!Array.isArray(contacts) || contacts.length === 0) {
      areaMessage(contactsArea, "No contact requests yet.", false);
      return;
    }
    contacts.forEach(function (c) { contactsArea.appendChild(buildContactCard(c)); });
  }

  function buildContactCard(contact) {
    var card = document.createElement("article");
    card.className = "admin-card";
    card.setAttribute("data-contact-id", String(contact.id));

    var email = document.createElement("p");
    email.className = "admin-card__email";
    email.textContent = contact.email; // safe: textContent, never innerHTML
    card.appendChild(email);

    var meta = document.createElement("p");
    meta.className = "admin-card__meta";
    meta.textContent = "Received " + formatDate(contact.created_at);
    card.appendChild(meta);

    var controls = document.createElement("div");
    controls.className = "admin-controls";

    // Status select
    var statusControl = document.createElement("label");
    statusControl.className = "admin-control";
    var statusText = document.createElement("span");
    statusText.className = "admin-control__label";
    statusText.textContent = "Status";
    statusControl.appendChild(statusText);
    var select = document.createElement("select");
    select.className = "admin-select";
    CONTACT_STATUSES.forEach(function (s) {
      var o = document.createElement("option");
      o.value = s;
      o.textContent = s;
      if (s === contact.status) o.selected = true;
      select.appendChild(o);
    });
    statusControl.appendChild(select);
    controls.appendChild(statusControl);

    // Delete area with a two-step inline confirmation
    var deleteWrap = document.createElement("div");
    deleteWrap.className = "admin-delete";
    var deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "btn btn--danger";
    deleteBtn.textContent = "Delete";
    deleteWrap.appendChild(deleteBtn);
    controls.appendChild(deleteWrap);

    card.appendChild(controls);

    var feedback = document.createElement("p");
    feedback.className = "admin-feedback";
    feedback.setAttribute("role", "status");
    card.appendChild(feedback);

    // Status change
    select.addEventListener("change", function () {
      select.disabled = true;
      feedback.className = "admin-feedback";
      feedback.textContent = "Saving…";
      apiFetch("/api/admin/contacts/" + contact.id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: select.value }),
      })
        .then(function (res) {
          if (!res.ok) throw new Error("save");
          feedback.className = "admin-feedback is-success";
          feedback.textContent = "Status updated.";
        })
        .catch(function (err) {
          if (err.message === "unauthenticated") return;
          feedback.className = "admin-feedback is-error";
          feedback.textContent = "Could not save. Please try again.";
        })
        .then(function () { select.disabled = false; });
    });

    // Two-step delete: first click asks for confirmation, second confirms.
    deleteBtn.addEventListener("click", function () {
      if (deleteWrap.getAttribute("data-confirming") === "true") return;
      deleteWrap.setAttribute("data-confirming", "true");
      deleteBtn.textContent = "Confirm delete";

      var cancelBtn = document.createElement("button");
      cancelBtn.type = "button";
      cancelBtn.className = "btn btn--secondary";
      cancelBtn.textContent = "Cancel";
      deleteWrap.appendChild(cancelBtn);

      function resetDelete() {
        deleteWrap.removeAttribute("data-confirming");
        deleteBtn.textContent = "Delete";
        deleteBtn.disabled = false;
        if (cancelBtn.parentNode) cancelBtn.parentNode.removeChild(cancelBtn);
      }

      cancelBtn.addEventListener("click", resetDelete);

      deleteBtn.addEventListener(
        "click",
        function confirmOnce() {
          deleteBtn.removeEventListener("click", confirmOnce);
          deleteBtn.disabled = true;
          cancelBtn.disabled = true;
          feedback.className = "admin-feedback";
          feedback.textContent = "Deleting…";
          apiFetch("/api/admin/contacts/" + contact.id, { method: "DELETE" })
            .then(function (res) {
              if (!res.ok) throw new Error("delete");
              // Remove the card from the page.
              if (card.parentNode) card.parentNode.removeChild(card);
            })
            .catch(function (err) {
              if (err.message === "unauthenticated") return;
              feedback.className = "admin-feedback is-error";
              feedback.textContent = "Could not delete. Please try again.";
              resetDelete();
            });
        },
        { once: true }
      );
    });

    return card;
  }

  /* ---- Logout -------------------------------------------------------- */
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      logoutBtn.disabled = true;
      fetch("/api/admin/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
        .then(function () { goLogin(); })
        .catch(function () { goLogin(); });
    });
  }

  /* ---- Start: confirm session, then load data ------------------------ */
  fetch("/api/admin/session")
    .then(function (r) { return r.json(); })
    .then(function (d) {
      if (!d || !d.authenticated) { goLogin(); return; }
      loadIdeas();
      loadContacts();
    })
    .catch(function () {
      areaMessage(ideasArea, "Could not verify your session. Please refresh.", true);
    });
})();
