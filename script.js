const waitlistForm = document.querySelector("#waitlistForm");
const interestSelect = document.querySelector("#interestSelect");
const customFeatureField = document.querySelector("#customFeatureField");
const customFeatureDetails = document.querySelector("#customFeatureDetails");
const formFeedback = document.querySelector("#formFeedback");
const interestTriggers = document.querySelectorAll("[data-interest-trigger]");

function syncCustomFeatureField() {
  if (!interestSelect || !customFeatureField || !customFeatureDetails) {
    return;
  }

  const showCustomField = interestSelect.value === "Custom feature request";
  customFeatureField.hidden = !showCustomField;
  customFeatureDetails.required = showCustomField;

  if (!showCustomField) {
    customFeatureDetails.value = "";
  }
}

function setInterestSelection(value) {
  if (!interestSelect) {
    return;
  }

  const hasOption = Array.from(interestSelect.options).some(
    (option) => option.value === value
  );

  if (!hasOption) {
    return;
  }

  interestSelect.value = value;
  syncCustomFeatureField();
  interestSelect.dispatchEvent(new Event("change"));
}

if (interestSelect) {
  syncCustomFeatureField();
  interestSelect.addEventListener("change", syncCustomFeatureField);
}

if (interestTriggers.length > 0) {
  interestTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const requestedInterest = trigger.getAttribute("data-interest-trigger");

      if (requestedInterest) {
        setInterestSelection(requestedInterest);
      }
    });
  });
}

if (waitlistForm) {
  waitlistForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(waitlistForm);
    const name = formData.get("name");
    const email = formData.get("email");
    const interest = formData.get("interest");
    const customFeatureDetailsValue = (
      formData.get("custom_feature_details") || ""
    ).toString();
    const requestBody =
      `Name: ${name}\nEmail: ${email}\nInterest: ${interest}${
        interest === "Custom feature request" && customFeatureDetailsValue
          ? `\nCustom feature details: ${customFeatureDetailsValue}`
          : ""
      }\n\nPlease add me to the Awake iOS waitlist.`;

    try {
      await navigator.clipboard.writeText(requestBody);
    } catch (error) {
      console.error("Clipboard copy failed", error);
    }

    if (formFeedback) {
      formFeedback.hidden = false;
    }
  });
}
