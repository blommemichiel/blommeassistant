class ApiService {
  constructor() {
    this.apiUrl = 'http://192.168.0.152:8009/api/v1';
  }

  handleError(response) {
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    return response;
  }

  async getSearchData(query) {
    const url = new URL(`${this.apiUrl}/all/search`);
    url.search = new URLSearchParams({ query });

    try {
      const response = await fetch(url);
      this.handleError(response);
      return await response.json();
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }
}

const apiService = new ApiService();
let magnetlink

const mockResults = [
  {
    name: "Mock Result 1",
    size: "1.5 GB",
    seeders: 100,
    leechers: 10,
    category: "Movies",
    date: "2024-01-01",
    downloads: 2000,
    magnet: "magnet:?xt=urn:btih:1234567890abcdef",
    url: "https://example.com/mock1"
  },
  {
    name: "Mock Result 2",
    size: "2.2 GB",
    seeders: 150,
    leechers: 15,
    category: "TV Shows",
    date: "2024-02-01",
    downloads: 3000,
    magnet: "magnet:?xt=urn:btih:0987654321abcdef",
    url: "https://example.com/mock2"
  },
  {
    name: "Mock Result 3",
    size: "800 MB",
    seeders: 50,
    leechers: 5,
    category: "Games",
    date: "2024-03-01",
    downloads: 1000,
    magnet: "magnet:?xt=urn:btih:abcdef1234567890",
    url: "https://example.com/mock3"
  }
];

function renderMockResults() {
  const searchResults = document.getElementById('searchResults');
  searchResults.innerHTML = ''; // Clear previous results

  mockResults.forEach(result => {
    const card = document.createElement('div');
    card.classList.add('card', 'mb-3');

    card.innerHTML = `
      <div class="card-body">
        <h5 class="card-title">${result.name}</h5>
        <p class="card-text">Size: ${result.size}<br>
          Seeders: ${result.seeders}<br>
          Leechers: ${result.leechers}<br>
          Category: ${result.category}<br>
          Date: ${result.date}<br>
          Downloads: ${result.downloads}</p>
      </div>
      <div class="card-footer">
        <button class="btn btn-primary download-button" data-bs-toggle="modal" data-bs-target="#modal-simple" data-magnet="${result.magnet}" data-name="${result.name}">Download to plex server</button>
        <a href="${result.url}" class="btn btn-info" target="_blank">More Info</a>
      </div>
    `;

    searchResults.appendChild(card);

    // Add event listener to each download button
    const downloadButton = card.querySelector('.download-button');
    downloadButton.addEventListener('click', function() {
      const name = this.getAttribute('data-name');
      const downloadConfirmationText = document.getElementById('downloadConfirmationText');
      downloadConfirmationText.textContent = `Do you really want to download ${name}?`;
      magnetlink = this.getAttribute('data-magnet')
    });
  });

  // Add event listener to confirm download button in modal
  const confirmDownloadButton = document.getElementById('confirmDownloadButton');
  confirmDownloadButton.addEventListener('click', function() {
    var selectedRadio = document.querySelector('input[name="radios"]:checked');

    // Get the value from the data-value attribute
    var selectedValue = selectedRadio ? selectedRadio.getAttribute('data-value') : null;
 
    // Now you have the selectedValue ('movie' or 'tvshow')
    if (selectedValue === 'movie') {
        console.log('Movie is selected.');
        // Perform actions specific to Movie selection
    } else if (selectedValue === 'tvshow') {
        console.log('TV Show is selected.');
        console.log(magnetlink)
        downloadTorrent(magnetlink, "tvshow")
    } else {
        console.log('No option selected.');
    }
 

    // Now you have the selectedValue
    console.log('Selected value:', selectedValue);
    console.log('Downloading...');
    // Close the modal after confirmation
    $('#modal-simple').modal('hide');
  });
}
//Download torrents
async function downloadTorrent(magnetLink, torrentType) {
  const apiUrl = 'http://192.168.0.152:8009/api/v1';  // Replace with your actual API base URL

  try {
      const response = await fetch(`${apiUrl}/torrent/download`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              magnet_link: magnetLink,
              type: torrentType,
          }),
      });

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to download torrent');
      }

      const responseData = await response.json();
      return responseData;
  } catch (error) {
      console.error('Error downloading torrent:', error.message);
      throw error;
  }
}

// Function to render search results dynamically from API data
function renderSearchResults(results) {
  results.sort((a, b) => b.seeders - a.seeders);

  const searchResults = document.getElementById('searchResults');
  searchResults.innerHTML = ''; // Clear previous results

  results.forEach(result => {
    const card = document.createElement('div');
    card.classList.add('card', 'mb-3');

    card.innerHTML = `
      <div class="card-body">
        <h5 class="card-title">${result.name}</h5>
        <p class="card-text">Size: ${result.size}<br>
          Seeders: ${result.seeders}<br>
          Leechers: ${result.leechers}<br>
          Category: ${result.category}<br>
          Date: ${result.date}<br>
          Downloads: ${result.downloads}</p>
      </div>
      <div class="card-footer">
        <button class="btn btn-primary download-button" data-bs-toggle="modal" data-bs-target="#modal-simple" data-magnet="${result.magnet}" data-name="${result.name}">Download to plex server</button>
        <a href="${result.url}" class="btn btn-info" target="_blank">More Info</a>
      </div>
    `;

    searchResults.appendChild(card);

    // Add event listener to each download button
    const downloadButton = card.querySelector('.download-button');
    downloadButton.addEventListener('click', function() {
      const name = this.getAttribute('data-name');
      const downloadConfirmationText = document.getElementById('downloadConfirmationText');
      downloadConfirmationText.textContent = `Do you really want to download ${name}?`;
      magnetlink = this.getAttribute('data-magnet')
    });
  });

  // Add event listener to confirm download button in modal
  const confirmDownloadButton = document.getElementById('confirmDownloadButton');
  confirmDownloadButton.addEventListener('click', function() {
    var selectedRadio = document.querySelector('input[name="radios"]:checked');

    // Get the value from the data-value attribute
    var selectedValue = selectedRadio ? selectedRadio.getAttribute('data-value') : null;
 
    // Now you have the selectedValue ('movie' or 'tvshow')
    if (selectedValue === 'movie') {
        console.log('Movie is selected.');
        downloadTorrent(magnetlink, "movie")
    } else if (selectedValue === 'tvshow') {
        console.log('TV Show is selected.');
        console.log(magnetlink)
        downloadTorrent(magnetlink, "tvshow")
    } else {
        console.log('No option selected.');
    }
 

    // Now you have the selectedValue
    console.log('Selected value:', selectedValue);
    console.log('Downloading...');
    // Close the modal after confirmation
    $('#modal-simple').modal('hide');
  });
}


// Event listener for search form submission
const searchForm = document.getElementById('searchForm');
searchForm.addEventListener('submit', async function(event) {
  event.preventDefault();
  const query = document.getElementById('searchInput').value.trim();
  const loadingBar = document.getElementById('loadingBar');
  loadingBar.style.display = 'flex';
  try {
    const searchData = await apiService.getSearchData(query);
    renderSearchResults(searchData.data); // Assuming API response has a 'data' array

    //renderMockResults();
  } catch (error) {
    console.error('Error fetching search data:', error);
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = '<p>Error fetching search data</p>';
  } finally {
    loadingBar.style.display = 'none';
  }
});
