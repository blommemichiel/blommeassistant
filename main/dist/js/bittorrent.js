async function getTorrentInfo(apiUrl) {
    try {
        const response = await fetch(`${apiUrl}/torrent/info`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Torrent Info:', data);

        // Filter torrents based on state
        const pausedUpTorrents = data.filter(torrent => torrent.state === 'pausedUP' || torrent.state === 'uploading');
        const downloadingTorrents = data.filter(torrent => torrent.state === 'downloading');
        const missingFilesTorrents = data.filter(torrent => torrent.state === 'missingFiles');

        // Sort torrents by completion_on in descending order
        pausedUpTorrents.sort((a, b) => new Date(b.completion_on) - new Date(a.completion_on));
        downloadingTorrents.sort((a, b) => new Date(b.completion_on) - new Date(a.completion_on));
        missingFilesTorrents.sort((a, b) => new Date(b.completion_on) - new Date(a.completion_on));


        // Assuming these functions will handle displaying the data in your UI
        populateDownloadTable(pausedUpTorrents, 'Paused Up Torrents');
        populateCurrentTable(downloadingTorrents, 'Downloading Torrents');
        populateErrorTable(missingFilesTorrents, 'Torrents with Missing Files');
        
    } catch (error) {
        console.error('An error occurred while fetching torrent info:', error);
    }
}


function populateDownloadTable(torrents) {
    const tableBody = document.getElementById('torrent-download-table-body');
    tableBody.innerHTML = '';
    torrents.forEach(torrent => {
      const row = document.createElement('tr');

      const nameCell = document.createElement('td');
      nameCell.textContent = cleanTitle(torrent.name);
      row.appendChild(nameCell);

      const sizeCell = document.createElement('td');
      sizeCell.textContent = formatSize(torrent.size);
      sizeCell.classList.add('text-secondary');
      row.appendChild(sizeCell);

      const progressCell = document.createElement('td');
      const newProgress = Math.floor(torrent.progress * 100);
      progressCell.innerHTML = `
        <div class="progress mb-2">
            <div class="progress-bar" style="width: ${newProgress}%" role="progressbar" aria-valuenow="38" aria-valuemin="0" aria-valuemax="100" aria-label="38% Complete">
                ${newProgress}%
            </div>
        </div>
      `;
      progressCell.classList.add('text-secondary');
      row.appendChild(progressCell);

      tableBody.appendChild(row);
    });
  }
  function populateCurrentTable(torrents) {
    const tableBody = document.getElementById('torrent-current-table-body');
    tableBody.innerHTML = '';
    torrents.forEach(torrent => {
      const row = document.createElement('tr');

      const nameCell = document.createElement('td');
      nameCell.textContent = cleanTitle(torrent.name);
      row.appendChild(nameCell);

      const sizeCell = document.createElement('td');
      sizeCell.textContent = formatSize(torrent.size);
      sizeCell.classList.add('text-secondary');
      row.appendChild(sizeCell);

      const progressCell = document.createElement('td');
      const newProgress = Math.floor(torrent.progress * 100);
      progressCell.innerHTML = `
        <div class="progress mb-2">
            <div class="progress-bar" style="width: ${newProgress}%" role="progressbar" aria-valuenow="38" aria-valuemin="0" aria-valuemax="100" aria-label="38% Complete">
                ${newProgress}%
            </div>
        </div>
      `;
      progressCell.classList.add('text-secondary');
      row.appendChild(progressCell);

      tableBody.appendChild(row);
    });
  }
  function populateErrorTable(torrents) {
    const tableBody = document.getElementById('torrent-error-table-body');
    tableBody.innerHTML = '';
    torrents.forEach(torrent => {
      const row = document.createElement('tr');

      const nameCell = document.createElement('td');
      nameCell.textContent = cleanTitle(torrent.name);
      row.appendChild(nameCell);

      const sizeCell = document.createElement('td');
      sizeCell.textContent = formatSize(torrent.size);
      sizeCell.classList.add('text-secondary');
      row.appendChild(sizeCell);

      const progressCell = document.createElement('td');
      const newProgress = Math.floor(torrent.progress * 100);
      progressCell.innerHTML = `
        <div class="progress mb-2">
            <div class="progress-bar" style="width: ${newProgress}%" role="progressbar" aria-valuenow="38" aria-valuemin="0" aria-valuemax="100" aria-label="38% Complete">
                ${newProgress}%
            </div>
        </div>
      `;
      progressCell.classList.add('text-secondary');
      row.appendChild(progressCell);

      tableBody.appendChild(row);
    });
  }
  function formatSize(size) {
    // Format size as appropriate, e.g., bytes to KB/MB/GB
    const i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
    return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'KB', 'MB', 'GB', 'TB'][i];
  }
  const cleanTitle = (title) => {
    // Remove known tags and unnecessary info
    return title.replace(/\[.*?\]|\(.*?\)|\b\d{4}\b|\.1080p|\.BluRay|\.WEB-DL|\.WEBRip|\.x264|\.mkv|\.Opus|\.5\.1|\.YTS\.MX|\.ExKinoRay|\.FlyingDutchman/g, '')
                .trim();
  };

document.addEventListener('DOMContentLoaded', () => {
    // Example usage with the API URL
    const apiUrl = 'http://192.168.0.152:8009/api/v1';

    getTorrentInfo(apiUrl);
    setInterval(() => {
        getTorrentInfo(apiUrl);
    }, 5000);

});

// Example usage with the API URL
const apiUrl = 'http://192.168.0.152:8009/api/v1';