'use strict'

// Get a list of items in inventory based on the classification_id
let classificationList = document.querySelector("#classificationList")
classificationList.addEventListener("change", function () {
  let classification_id = classificationList.value
  console.log(`classification_id is: ${classification_id}`)
  let classIdURL = "/inv/getMarketplace/" + classification_id
  fetch(classIdURL)
    .then(function (response) {
      if (response.ok) {
        return response.json();
      }
      throw Error("Network response was not OK");
    })
    .then(function (data) {
      console.log(data);
      buildMarketplaceGrid(data);
    })
    .catch(function (error) {
      console.log('There was a problem: ', error.message)
    })
})

// Build inventory items into HTML table components and inject into DOM
function buildMarketplaceGrid(data) {
  const marketplaceDisplay = document.getElementById("marketplaceDisplay");
  marketplaceDisplay.innerHTML = '';

  if (!data || data.length === 0) {
    marketplaceDisplay.innerHTML = '<p>No inventory items found for this classification.</p>';
    return;
  }

  data.forEach(item => {
    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(item.inv_price);

    const isLiked = Boolean(item.liked);
    const comments = item.comments || [];

    const card = document.createElement('div');
    card.classList.add('marketplace-card');
    card.style.border = '1px solid #ccc';
    card.style.borderRadius = '8px';
    card.style.padding = '1rem';
    card.style.margin = '1rem';
    card.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
    card.style.maxWidth = '300px';

    // Build comments HTML
    const commentListHTML = comments.map(comment => {
      const text = typeof comment === 'string' ? comment : comment.text;
      return `<p style="margin: 0.25rem 0; padding: 0.25rem; background: #f9f9f9; border-radius: 4px;">${text}</p>`;
    }).join('');

    card.innerHTML = `
      <img src="${item.inv_image}" alt="${item.inv_make} ${item.inv_model}" style="width:100%; border-radius: 6px;">
      <h2 style="margin-top: 0.5rem;">${item.inv_make} ${item.inv_model}</h2>
      <p>${item.inv_description}</p>
      <p style="font-weight: bold;">${formattedPrice}</p>

      <form class="feedback-form" data-item-id="${item.inv_id}" style="margin-top: 1rem;">
        <input type="hidden" name="inv_id" value="${item.inv_id}">
        <input type="hidden" name="liked" value="${isLiked}">
        
        <button type="button" class="like-btn" style="background: none; border: none; cursor: pointer; font-size: 1.5rem;" aria-label="Like this item">
          <i class="${isLiked ? 'fa-solid' : 'fa-regular'} fa-heart" style="color: ${isLiked ? 'red' : 'inherit'};"></i>
        </button>

        <div class="comment-box" style="margin-top: 0.5rem;">
          <textarea name="comment" rows="2" placeholder="Leave a comment..." style="width: 100%; resize: vertical;" required></textarea>
        </div>

        <button type="submit" style="margin-top: 0.5rem; padding: 0.5rem 1rem; border: none; background-color: #007BFF; color: white; border-radius: 4px; cursor: pointer;">
          Publish Comment
        </button>

        <div class="existing-comments" style="margin-top: 0.75rem;">
          <strong>Comments:</strong>
          ${commentListHTML || '<p style="font-style: italic; color: #666;">No comments yet.</p>'}
        </div>
      </form>

      <button class="buy-button" style="margin-top: 0.5rem; padding: 0.5rem 1rem; border: none; background-color: #007BFF; color: white; border-radius: 4px; cursor: pointer;">Buy</button>
    `;

    // Like toggle
    const form = card.querySelector('.feedback-form');
    const likeButton = form.querySelector('.like-btn');
    const heartIcon = likeButton.querySelector('i');
    const likedInput = form.querySelector('input[name="liked"]');

    likeButton.addEventListener('click', () => {
      const isNowLiked = heartIcon.classList.toggle('fa-solid');
      heartIcon.classList.toggle('fa-regular');
      heartIcon.style.color = isNowLiked ? 'red' : 'inherit';
      likedInput.value = isNowLiked.toString();
    });

    // Submit feedback
    form.addEventListener('submit', function (event) {
      event.preventDefault();

      const formData = new FormData(form);
      const dataToSend = {
        inv_id: formData.get('inv_id'),
        liked: formData.get('liked') === 'true',
        comment: formData.get('comment'),
        classification_id: classificationList.value
      };

      fetch('/inv/postFeedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      })
        .then(response => {
          if (response.ok) {
            form.querySelector('textarea').value = '';
          } else {
            throw new Error('Failed to submit feedback');
          }
        })
        .catch(error => {
          console.error('Error:', error);
        });
    });

    marketplaceDisplay.appendChild(card);
  });
}


