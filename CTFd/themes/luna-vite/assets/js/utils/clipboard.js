import tippy from 'tippy.js';

export function copyToClipboard($input) {
  const tooltip = tippy($input, {
    content: "Copied!",
    trigger: "manual",
    theme: "lunaDefault",
    appendTo: "parent",
    arrow: false,
  });

  navigator.clipboard.writeText($input.value).then(() => {
    tooltip.show();
    setTimeout(() => {
      tooltip.hide();
      tooltip.destroy();
    }, 1500);
  });
}

export function copyTextToClipboard(text, $input) {
  const tooltip = tippy($input, {
    content: "Copied!",
    trigger: "manual",
    theme: "lunaDefault",
    appendTo: "parent",
    arrow: false,
  });

  navigator.clipboard.writeText(text).then(() => {
    tooltip.show();
    setTimeout(() => {
      tooltip.hide();
      tooltip.destroy();
    }, 1500);
  });
}
