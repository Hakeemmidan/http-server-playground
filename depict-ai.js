/* eslint-disable no-console */
/* eslint-disable camelcase */
// Before page render, don't display existing items in the list. Show them as white boxes.
// Iterate over each item, lookup its depict counterpart.
// Replace with returned result from depict.

// First fetch using product-card class name
// If that fails, lookup using card slider

// eslint-disable-next-line max-statements
async function render_depict_recommendations() {
  // 1. Load CSS
  const head = document.getElementsByTagName('HEAD')[0];
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = 'http://localhost:1234/styling/main.css';
  head.appendChild(link);

  // 2. Get product ID
  /*
    If it's not defined, log to depict to correlate store
  */
  const product_id = window.location.pathname.split('/').at(-2);
  if (!product_id) {
    // log error to depict correlated store
    return;
  }

  // 3. Get depict.ai recommendations
  /*
    If none returned, log to depict to corresponding store AND product ID
  */
  const recommendations = await get_recommendations(product_id);
  if (!recommendations || !recommendations.length) {
    // log error to depict correlated store
    return;
  }

  // 4. Add recommendations to UI
  // 4.1. Create horizontal scroll row div
  const horizontal_scroll_div = document.createElement('div');
  horizontal_scroll_div.className =
    'depict-recommendations__horizontal-scroll-row';
  // 4.2. Attach it to bottom of product show container
  const product_show_container = document.querySelector(
    '#js-product-page .product .container'
  );
  product_show_container.appendChild(horizontal_scroll_div);

  // 4.3. Iterate over items and attach each to horizontal_scroll_div
  recommendations.forEach((recommendation) => {
    const recommendation_div = document.createElement('div');
    recommendation_div.className = 'depict-recommendations__recommendation-item';
    // create image
    const recommendation_img = document.createElement('img');
    recommendation_img.className = 'depict-recommendations__recommendation-img';
    recommendation_img.src = recommendation.image_url;
    // create title
    const recommendation_title = document.createElement('h3');
    recommendation_title.className = 'depict-recommendations__recommendation-title';
    recommendation_title.innerText = recommendation.title;
    // create price
    const recommendation_price = document.createElement('p');
    recommendation_price.className = 'depict-recommendations__recommendation-price';
    recommendation_price.innerText = recommendation.sale_price;

    // add elements to recommendation_div
    recommendation_div.append(recommendation_img, recommendation_title, recommendation_price);

    // add to horizontal_scroll_div
    horizontal_scroll_div.append(recommendation_div);
  });
}

async function get_recommendations(product_id) {
  const body = JSON.stringify({
    tenant: 'mq',
    market: 'default',
    type: 'normal',
    user_id: get_depict_id(),
    dsid: get_depict_id(),
    document_referrer: document.referrer,
    product_id,
  });

  let displays;

  try {
    const response = await fetch(
      'https://api.depict.ai/v2/recommend/products/product',
      {
        body,
        method: 'POST',
      }
    );
    const decoded_json = await response.json();
    displays = decoded_json ? decoded_json.displays : null;
  } catch (e) {
    console.error('[depict]', 'failed getting recommendations', e);
  }

  return displays || [];
}

function get_depict_id() {
  return (localStorage._dep_id = localStorage._dep_id || (Math.random() * 2e17).toString(36));
}

window.addEventListener('load', render_depict_recommendations);
