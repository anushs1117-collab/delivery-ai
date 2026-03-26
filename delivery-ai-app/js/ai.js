// ===== AI ASSISTANT =====

const aiKnowledge = {
  greetings: ['hello','hi','hey','good morning','good evening','namaste'],
  tracking: ['track','where is','my order','status','location','find order'],
  pricing: ['price','cost','rate','charge','fee','cheap','expensive','how much'],
  cancel: ['cancel','cancellation','stop','refund'],
  prohibited: ['prohibited','not allowed','banned','restrict','illegal'],
  delivery: ['how long','delivery time','days','when will'],
  driver: ['driver','agent','person','who is delivering'],
  help: ['help','support','problem','issue','not received'],
  payment: ['pay','payment','upi','card','cod','cash'],
  weight: ['weight','heavy','size','dimension'],
};

function getAIResponse(userMsg) {
  const msg = userMsg.toLowerCase();
  const orders = getOrders();

  // Check for order ID in message
  const orderMatch = msg.match(/sd-\d+/i);
  if (orderMatch) {
    const orderId = orderMatch[0].toUpperCase();
    const order = orders.find(o => o.id === orderId);
    if (order) {
      return `📦 **Order ${order.id}** — *${order.pkgName}*\n\n` +
        `Status: ${statusLabelAI(order.status)}\n` +
        `From: ${order.from}\n` +
        `To: ${order.to}\n` +
        `Recipient: ${order.recipient}\n` +
        `Estimated Delivery: ${formatDateAI(order.estimatedDelivery)}\n\n` +
        (order.driver ? `🚗 Driver: ${order.driver}` : '⏳ Driver not yet assigned.') +
        `\n\nWould you like to track it in detail? Click the Track tab or say "track ${orderId}".`;
    } else {
      return `❌ I couldn't find order **${orderId}** in our system. Please double-check the order ID. It should look like SD-1042.`;
    }
  }

  // Greetings
  if (aiKnowledge.greetings.some(g => msg.includes(g))) {
    const greets = ['Hello! 👋 Great to see you. How can I assist with your deliveries today?', 'Hey there! 😊 I\'m your SwiftDrop AI assistant. What do you need?', 'Hi! Ready to help you with orders, tracking, or any delivery questions!'];
    return greets[Math.floor(Math.random() * greets.length)];
  }

  // Tracking
  if (aiKnowledge.tracking.some(k => msg.includes(k))) {
    const active = orders.filter(o => o.status === 'transit' || o.status === 'pending');
    if (active.length > 0) {
      return `📍 You have **${active.length}** active order(s):\n\n` +
        active.map(o => `• **${o.id}** — ${o.pkgName} (${statusLabelAI(o.status)})`).join('\n') +
        `\n\nTell me a specific order ID for full tracking details!`;
    }
    return `📦 You don't have any active orders right now. Place a new order from the **New Order** tab!\n\nIf you have an order ID, type it here and I'll look it up instantly.`;
  }

  // Pricing
  if (aiKnowledge.pricing.some(k => msg.includes(k))) {
    return `💰 **SwiftDrop Pricing:**\n\n` +
      `• **Standard (3-5 days):** Starting at ₹50 + ₹15/kg\n` +
      `• **Express (1-2 days):** Starting at ₹120 + ₹15/kg\n` +
      `• **Same Day:** Starting at ₹250 + ₹15/kg\n\n` +
      `📊 Use the **New Order** tab and click "Get AI Estimate" for an exact quote based on your package and route!\n\n` +
      `💡 *Tip: Standard is best for non-urgent items. Express offers the best value for urgent deliveries.*`;
  }

  // Cancel
  if (aiKnowledge.cancel.some(k => msg.includes(k))) {
    return `❌ **Cancellation Policy:**\n\n` +
      `• **Pending orders:** Can be cancelled anytime — full refund\n` +
      `• **In Transit:** Cannot be cancelled (package is already on its way)\n` +
      `• **Delivered:** No cancellation possible\n\n` +
      `💳 Refunds are processed within **3-5 business days** to your original payment method.\n\n` +
      `To cancel, contact our support at support@swiftdrop.in or call 1800-SWIFT-01.`;
  }

  // Prohibited
  if (aiKnowledge.prohibited.some(k => msg.includes(k))) {
    return `🚫 **Prohibited Items (cannot be shipped):**\n\n` +
      `• Explosives, flammables, or hazardous materials\n` +
      `• Illegal drugs or controlled substances\n` +
      `• Live animals (except licensed handlers)\n` +
      `• Counterfeit goods\n` +
      `• Weapons or ammunition\n` +
      `• Perishables without special packaging\n\n` +
      `✅ If you're unsure about an item, just ask me and I'll let you know!`;
  }

  // Delivery time
  if (aiKnowledge.delivery.some(k => msg.includes(k))) {
    return `⏱️ **Delivery Timelines:**\n\n` +
      `• **Same Day:** Order by 12 PM for delivery by 8 PM\n` +
      `• **Express:** Next 1-2 business days\n` +
      `• **Standard:** 3-5 business days\n\n` +
      `📍 Times may vary based on your location and local conditions. Tracking updates are sent via SMS!\n\n` +
      `Which delivery type are you interested in?`;
  }

  // Driver info
  if (aiKnowledge.driver.some(k => msg.includes(k))) {
    return `🚗 **Driver Assignment:**\n\n` +
      `Drivers are assigned once your package is picked up. You'll receive:\n` +
      `• Driver name & photo\n` +
      `• Live location link via SMS\n` +
      `• Estimated arrival time\n\n` +
      `If you have an active order, share the Order ID and I can check if a driver is assigned!`;
  }

  // Payment
  if (aiKnowledge.payment.some(k => msg.includes(k))) {
    return `💳 **Payment Options:**\n\n` +
      `• UPI (Google Pay, PhonePe, Paytm)\n` +
      `• Credit / Debit Cards\n` +
      `• Net Banking\n` +
      `• Cash on Delivery (COD) — available on Standard deliveries\n` +
      `• Wallet (SwiftDrop Credits)\n\n` +
      `All payments are secured with 256-bit SSL encryption. 🔒`;
  }

  // Weight / size
  if (aiKnowledge.weight.some(k => msg.includes(k))) {
    return `📏 **Package Guidelines:**\n\n` +
      `• **Max weight:** 50 kg per package\n` +
      `• **Max dimensions:** 120cm x 80cm x 60cm\n` +
      `• Oversized packages may have additional charges\n` +
      `• Fragile items require special packaging (we can arrange for ₹50 extra)\n\n` +
      `For bulk shipments (>10 packages), contact our business team at business@swiftdrop.in`;
  }

  // Help / support
  if (aiKnowledge.help.some(k => msg.includes(k))) {
    return `🛠️ **I'm here to help!** Here's what I can do:\n\n` +
      `• 📍 Track any order by ID\n` +
      `• 💰 Estimate delivery costs\n` +
      `• ❓ Answer delivery questions\n` +
      `• 📋 View your order history\n\n` +
      `For urgent issues, contact support:\n` +
      `📞 **1800-SWIFT-01** (24/7)\n` +
      `📧 **support@swiftdrop.in**\n\n` +
      `What specifically can I help you with today?`;
  }

  // Statistics
  if (msg.includes('statistic') || msg.includes('summary') || msg.includes('how many')) {
    const total = orders.length;
    const delivered = orders.filter(o => o.status === 'delivered').length;
    const transit = orders.filter(o => o.status === 'transit').length;
    const pending = orders.filter(o => o.status === 'pending').length;
    return `📊 **Your Delivery Summary:**\n\n` +
      `• Total Orders: **${total}**\n` +
      `• ✅ Delivered: **${delivered}**\n` +
      `• 🚚 In Transit: **${transit}**\n` +
      `• ⏳ Pending: **${pending}**\n\n` +
      `Overall success rate: **${total > 0 ? Math.round(delivered/total*100) : 0}%** 🎉`;
  }

  // Default fallback
  const fallbacks = [
    `I understand you're asking about "${userMsg}". Could you be more specific? I can help with:\n\n• Order tracking\n• Pricing & estimates\n• Delivery timelines\n• Cancellations\n• Payment methods`,
    `Great question! For "${userMsg}", I'd recommend checking the relevant section of the app or contact our 24/7 support at 1800-SWIFT-01.\n\nOr try asking me about: tracking, pricing, delivery times, or cancellation!`,
    `Hmm, I'm not sure I fully understood that. Could you rephrase it? 🤔\n\nI'm best at helping with order tracking, pricing, and delivery questions!`
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

function statusLabelAI(s) {
  const m = { transit: '🚚 In Transit', delivered: '✅ Delivered', pending: '⏳ Pending', cancelled: '❌ Cancelled' };
  return m[s] || s;
}
function formatDateAI(iso) {
  if (!iso) return 'N/A';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function addChatMessage(content, isUser = false) {
  const container = document.getElementById('chatMessages');
  const msg = document.createElement('div');
  msg.className = 'ai-msg ' + (isUser ? 'user' : 'bot');

  // Convert **bold** and newlines to HTML
  const formatted = content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');

  msg.innerHTML = `
    <div class="msg-avatar">${isUser ? '👤' : '🤖'}</div>
    <div class="msg-bubble">${formatted}</div>`;
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
}

function addTypingIndicator() {
  const container = document.getElementById('chatMessages');
  const msg = document.createElement('div');
  msg.className = 'ai-msg bot';
  msg.id = 'typingIndicator';
  msg.innerHTML = `
    <div class="msg-avatar">🤖</div>
    <div class="msg-bubble typing">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>`;
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
}

function removeTypingIndicator() {
  const el = document.getElementById('typingIndicator');
  if (el) el.remove();
}

function sendChat() {
  const input = document.getElementById('chatInput');
  const msg = input.value.trim();
  if (!msg) return;
  input.value = '';

  addChatMessage(msg, true);
  addTypingIndicator();

  // Simulate AI thinking delay
  const delay = 600 + Math.random() * 800;
  setTimeout(() => {
    removeTypingIndicator();
    const response = getAIResponse(msg);
    addChatMessage(response, false);
  }, delay);
}

function sendQuickPrompt(prompt) {
  document.getElementById('chatInput').value = prompt;
  sendChat();
}
