/* =========================================================================
   login.js — admin login page behaviour.
   Sends the password to POST /api/admin/login as JSON. Never stores the
   password anywhere, never puts it in the URL, never logs it.
   ========================================================================= */
(function () {
  "use strict";

  var form = document.getElementById("loginForm");
  var passwordInput = document.getElementById("password");
  var submitBtn = document.getElementById("loginSubmit");
  var statusEl = document.getElementById("loginStatus");

  function setStatus(message, isError) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.classList.toggle("is-error", !!isError);
  }

  // If already logged in, go straight to the dashboard.
  fetch("/api/admin/session")
    .then(function (r) { return r.json(); })
    .then(function (d) { if (d && d.authenticated) window.location.replace("/admin"); })
    .catch(function () { /* ignore — show the login form */ });

  if (form && passwordInput && submitBtn) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var password = passwordInput.value;
      if (!password) {
        setStatus("Please enter the password.", true);
        passwordInput.focus();
        return;
      }

      var originalLabel = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "Logging in…";
      setStatus("", false);

      fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: password }),
      })
        .then(function (response) {
          return response.json().then(function (data) {
            return { ok: response.ok, data: data };
          });
        })
        .then(function (result) {
          if (!result.ok) {
            throw new Error((result.data && result.data.error) || "Incorrect password.");
          }
          window.location.replace("/admin");
        })
        .catch(function (err) {
          setStatus(err.message || "Incorrect password.", true);
          submitBtn.disabled = false;
          submitBtn.textContent = originalLabel;
          passwordInput.value = ""; // clear the field after a failed attempt
          passwordInput.focus();
        });
    });
  }
})();
