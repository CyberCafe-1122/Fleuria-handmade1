export function formatCurrency(amount, currency = 'DA') {
  const val = Number(amount) || 0;
  const curr = (currency || 'DA').trim();
  const isDZD = curr === 'DA' || curr === 'DZD' || curr === 'د.ج';

  if (isDZD) {
    const formatted = Math.round(val)
      .toLocaleString('fr-DZ', { maximumFractionDigits: 0 })
      .replace(/\u202F/g, ' ');
    return `${formatted} ${curr}`;
  }

  if (['$', '£', '€', '¥'].includes(curr)) {
    return `${curr}${val.toFixed(2)}`;
  }

  return `${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${curr}`;
}

export function formatDate(dateString) {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return dateString;
  }
}

export function formatShortDate(dateString) {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (e) {
    return dateString;
  }
}
