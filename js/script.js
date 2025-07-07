// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// NASA APOD API key
const NASA_API_KEY = 'uP3GxXr5xNXg62uWybjQSvjxp71Ft5GdsbTNdLT9';

// Find the gallery container and the button
const gallery = document.getElementById('gallery');
const getImagesButton = document.querySelector('.filters button');

// Function to fetch APOD data for a date range
function fetchApodData(startDate, endDate) {
  // Show a loading message before fetching
  gallery.innerHTML = `
    <div class="placeholder">
      <div class="placeholder-icon">🚀</div>
      <p>Loading images...</p>
    </div>
  `;

  // Build the API URL using template literals
  const url = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}&start_date=${startDate}&end_date=${endDate}`;

  // Use fetch to get data from the API
  fetch(url)
    .then(response => response.json()) // Convert the response to JSON
    .then(data => {
      // Log the data to the console so we can see it
      console.log('NASA APOD data:', data);
      // If the API returns a single object, put it in an array
      const items = Array.isArray(data) ? data : [data];
      showGallery(items);
    })
    .catch(error => {
      // If there is an error, log it
      console.error('Error fetching APOD data:', error);
      // Show error message in the gallery
      gallery.innerHTML = `
        <div class="placeholder">
          <div class="placeholder-icon">❌</div>
          <p>Could not load images. Please try again.</p>
        </div>
      `;
    });
}

// Create a modal element and add it to the page (only once)
let modal = document.getElementById('image-modal');
if (!modal) {
  modal = document.createElement('div');
  modal.id = 'image-modal';
  modal.style.display = 'none';
  modal.innerHTML = `
    <div class="modal-content">
      <span class="modal-close">&times;</span>
      <!-- We'll show either an image or a video here -->
      <div class="modal-media"></div>
      <h2 class="modal-title"></h2>
      <p class="modal-date"></p>
      <p class="modal-explanation"></p>
    </div>
  `;
  document.body.appendChild(modal);
}

// Function to open the modal with image or video details
function openModal(item) {
  // Find modal elements
  const mediaDiv = modal.querySelector('.modal-media');
  const title = modal.querySelector('.modal-title');
  const date = modal.querySelector('.modal-date');
  const explanation = modal.querySelector('.modal-explanation');

  // Clear previous media content
  mediaDiv.innerHTML = '';

  // Set modal content
  title.textContent = item.title;
  date.textContent = item.date;
  explanation.textContent = item.explanation;

  // Prevent background from scrolling
  document.body.classList.add('modal-open');

  // Show image or embed video
  if (item.media_type === 'image') {
    // Create an image element
    const img = document.createElement('img');
    img.className = 'modal-img';
    img.src = item.hdurl || item.url;
    img.alt = item.title;
    // Show modal immediately, image will load in place
    modal.style.display = 'flex';
    img.onload = () => {
      // No need to change modal display, already flex
    };
    img.onerror = () => {
      // No need to change modal display, already flex
    };
    mediaDiv.appendChild(img);
  } else if (item.media_type === 'video') {
    let videoEmbed = '';
    if (item.url.includes('youtube.com') || item.url.includes('youtu.be')) {
      let videoId = '';
      const youtubeMatch = item.url.match(/v=([^&]+)/);
      const youtuBeMatch = item.url.match(/youtu\.be\/([^?&]+)/);
      if (youtubeMatch) {
        videoId = youtubeMatch[1];
      } else if (youtuBeMatch) {
        videoId = youtuBeMatch[1];
      }
      if (videoId) {
        videoEmbed = `
          <div class="responsive-video">
            <iframe src="https://www.youtube.com/embed/${videoId}" 
              frameborder="0" allowfullscreen></iframe>
          </div>
        `;
      }
    }

    if (!videoEmbed) {
      videoEmbed = `
          <a href="${item.url}" target="_blank" rel="noopener">
          <img class="modal-img" src="img/video-placeholder.png" alt="video placeholder"/></a>
        
      `;
    }
    mediaDiv.innerHTML = videoEmbed;
    modal.style.display = 'flex';
  }
}

// Function to close the modal
function closeModal() {
  modal.style.display = 'none';
  // Allow background to scroll again
  document.body.classList.remove('modal-open');
}

// Close modal when clicking the close button or outside the modal content
modal.addEventListener('click', (event) => {
  if (
    event.target === modal ||
    event.target.classList.contains('modal-close')
  ) {
    closeModal();
  }
});

// Function to show the images in the gallery
function showGallery(items) {
  // Clear the gallery first
  gallery.innerHTML = '';

  // If there are no items, show a message
  if (!items || items.length === 0) {
    gallery.innerHTML = `
      <div class="placeholder">
        <div class="placeholder-icon">🔭</div>
        <p>No images found for this date range.</p>
      </div>
    `;
    return;
  }

  // Loop through each item and create a gallery card
  items.forEach(item => {
    // Create a div for each gallery item
    const div = document.createElement('div');
    div.className = 'gallery-item';

    if (item.media_type === 'image') {
      // If the item is an image, show the image, title, and date
      div.innerHTML = `
        <img src="${item.url}" alt="${item.title}" />
        <h3>${item.title}</h3>
        <p>${item.date}</p>
      `;
      // When clicked, open the modal with details
      div.addEventListener('click', () => {
        openModal(item);
      });
    } else if (item.media_type === 'video') {
      // If the item is a video, try to embed it if it's from YouTube
      let videoEmbed = '';
      let videoId = '';
      if (item.url.includes('youtube.com') || item.url.includes('youtu.be')) {
        const youtubeMatch = item.url.match(/v=([^&]+)/);
        const youtuBeMatch = item.url.match(/youtu\.be\/([^?&]+)/);
        if (youtubeMatch) {
          videoId = youtubeMatch[1];
        } else if (youtuBeMatch) {
          videoId = youtuBeMatch[1];
        }
        if (videoId) {
          videoEmbed = `
            <div class="responsive-video">
              <iframe src="https://www.youtube.com/embed/${videoId}" 
                frameborder="0" allowfullscreen></iframe>
            </div>
            <h3>${item.title}</h3>
            <p>${item.date}</p>
          `;
        }
      }
      // If not a YouTube video, show a placeholder image and link
      if (!videoEmbed) {
        videoEmbed = `
          <img src="img/video-placeholder.png" alt="video placeholder" />
          <h3><a href ="${item.url}" target="_blank" rel="noopener">${item.title}</a></h3>
          <p>${item.date}</p>
        `;
      }
      div.innerHTML = videoEmbed;
      // When clicked, open the modal with details
      div.addEventListener('click', () => {
        openModal(item);
      });
    }
    // Add the gallery item to the gallery
    gallery.appendChild(div);
  });

  // If no items were added (should not happen), show a message
  if (gallery.children.length === 0) {
    gallery.innerHTML = `
      <div class="placeholder">
        <div class="placeholder-icon">🔭</div>
        <p>No images found for this date range.</p>
      </div>
    `;
  }
  }

// Listen for changes to the date inputs
// (No longer fetch images when dates change, only update when button is clicked)

// When the button is clicked, fetch and show images for the selected date range
getImagesButton.addEventListener('click', () => {
  // Get the selected dates
  const startDate = startInput.value;
  const endDate = endInput.value;
  // Fetch APOD data for the new date range
  fetchApodData(startDate, endDate);
});
