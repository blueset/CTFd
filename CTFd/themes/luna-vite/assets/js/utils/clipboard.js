import tippy from 'tippy.js';

export function copyToClipboard($input) {
  copyTextToClipboard($input.value, $input);
}

export function copyTextToClipboard(text, $input) {
  const tooltip = tippy($input, {
    content: navigator.clipboard === undefined ? "Clipboard is not available." : "Copied!",
    trigger: "manual",
    theme: "lunaDefault",
    appendTo: "parent",
    arrow: false,
  });

  const showTooltip = () => {
    tooltip.show();
    setTimeout(() => {
      tooltip.hide();
      tooltip.destroy();
    }, 1500);
  };

  if (navigator.clipboard === undefined) showTooltip();
  else navigator.clipboard.writeText(text).then(showTooltip);
}
