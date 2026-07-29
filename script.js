const waitlistForm = document.querySelector("#waitlistForm");
const interestSelect = document.querySelector("#interestSelect");
const customFeatureField = document.querySelector("#customFeatureField");
const customFeatureDetails = document.querySelector("#customFeatureDetails");
const formFeedback = document.querySelector("#formFeedback");
const formError = document.querySelector("#formError");
const interestTriggers = document.querySelectorAll("[data-interest-trigger]");
const earlyAdopterModal = document.querySelector("#earlyAdopterModal");
const earlyAdopterForm = document.querySelector("#earlyAdopterForm");
const earlyAdopterFeedback = document.querySelector("#earlyAdopterFeedback");
const earlyAdopterTriggers = document.querySelectorAll(".early-adopter-trigger");
const closeEarlyAdopter = document.querySelector(".modal-close");

const stripePaymentLink = window.AWAKE_CONFIG?.stripePaymentLink?.trim() || "";

function syncCustomFeatureField() {
  if (!interestSelect || !customFeatureField || !customFeatureDetails) return;

  const showCustomField = interestSelect.value === "Custom feature request";
  customFeatureField.hidden = !showCustomField;
  customFeatureDetails.required = showCustomField;

  if (!showCustomField) customFeatureDetails.value = "";
}

function setInterestSelection(value) {
  if (!interestSelect) return;

  const hasOption = Array.from(interestSelect.options).some((option) => option.value === value);
  if (!hasOption) return;

  interestSelect.value = value;
  syncCustomFeatureField();
}

function showMessage(element, message) {
  if (!element) return;
  element.textContent = message;
  element.hidden = false;
}

function hideMessage(element) {
  if (element) element.hidden = true;
}

async function submitLead({ name, email, interest, details = "", website = "" }) {
  const result = await fetch("/api/waitlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, interest, details, website }),
  });

  const data = await result.json().catch(() => ({}));
  if (!result.ok) throw new Error(data.error || "We could not save your signup. Please try again.");
}

if (interestSelect) {
  syncCustomFeatureField();
  interestSelect.addEventListener("change", syncCustomFeatureField);
}

interestTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const requestedInterest = trigger.getAttribute("data-interest-trigger");
    if (requestedInterest) setInterestSelection(requestedInterest);
  });
});

if (waitlistForm) {
  waitlistForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    hideMessage(formFeedback);
    hideMessage(formError);

    const submitButton = waitlistForm.querySelector('button[type="submit"]');
    const formData = new FormData(waitlistForm);
    submitButton.disabled = true;
    submitButton.textContent = "Joining...";

    try {
      await submitLead({
        name: formData.get("name"),
        email: formData.get("email"),
        interest: formData.get("interest"),
        details: formData.get("custom_feature_details"),
        website: formData.get("website"),
      });
      waitlistForm.reset();
      syncCustomFeatureField();
      showMessage(formFeedback, "You are on the list. Watch your inbox for Awake launch and beta news.");
    } catch (error) {
      showMessage(formError, error.message);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Join waitlist";
    }
  });
}

earlyAdopterTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    if (!earlyAdopterModal) return;
    hideMessage(earlyAdopterFeedback);
    earlyAdopterModal.showModal();
  });
});

if (closeEarlyAdopter && earlyAdopterModal) {
  closeEarlyAdopter.addEventListener("click", () => earlyAdopterModal.close());
  earlyAdopterModal.addEventListener("click", (event) => {
    if (event.target === earlyAdopterModal) earlyAdopterModal.close();
  });
}

if (earlyAdopterForm) {
  earlyAdopterForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    hideMessage(earlyAdopterFeedback);

    if (!stripePaymentLink || stripePaymentLink.includes("REPLACE")) {
      showMessage(earlyAdopterFeedback, "Checkout is being prepared. Please join the free waitlist for the launch announcement.");
      return;
    }

    const submitButton = earlyAdopterForm.querySelector('button[type="submit"]');
    const formData = new FormData(earlyAdopterForm);
    submitButton.disabled = true;
    submitButton.textContent = "Opening secure checkout...";

    // Stripe collects the buyer email too, so a temporary lead-delivery issue
    // must never prevent an otherwise valid payment from reaching checkout.
    void submitLead({
      name: "Early Adopter",
      email: formData.get("email"),
      interest: "Early Adopter ($5) - checkout started",
    }).catch((error) => console.error("Early Adopter lead capture failed", error));

    window.location.assign(stripePaymentLink);
  });
}
