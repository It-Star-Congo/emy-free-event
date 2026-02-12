function getCart(session) {
  if (!session.quoteCart) session.quoteCart = [];
  return session.quoteCart;
}

function addToCart(session, product, quantity = 1) {
  const cart = getCart(session);
  const idx = cart.findIndex((i) => i.productId === product.id);
  const normalizedQty = Math.max(1, Number(quantity || 1));
  if (idx >= 0) {
    cart[idx].quantity += normalizedQty;
  } else {
    cart.push({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      pricePerDay: product.pricePerDay,
      quantity: normalizedQty
    });
  }
  session.quoteCart = cart;
  return cart;
}

function removeFromCart(session, productId) {
  const cart = getCart(session).filter((i) => i.productId !== Number(productId));
  session.quoteCart = cart;
  return cart;
}

function updateQuantity(session, productId, quantity) {
  const cart = getCart(session);
  const item = cart.find((i) => i.productId === Number(productId));
  if (item) item.quantity = Math.max(1, Number(quantity || 1));
  session.quoteCart = cart;
  return cart;
}

module.exports = { getCart, addToCart, removeFromCart, updateQuantity };

