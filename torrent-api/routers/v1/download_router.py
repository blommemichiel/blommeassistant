from fastapi import APIRouter, HTTPException, status
from qbittorrent import Client
import time
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

router = APIRouter(tags=["Torrent"])

# Initialize qbittorrent client
qb = Client('http://127.0.0.1:8080/')
qb.login('admin', 'supersecretpassword')  # Replace with your qbittorrent username and password
@router.post("/download")
async def download_torrent_with_magnet(magnet_info: dict):
    """
    Endpoint to download a torrent using a magnet link provided in the request body.
    
    :param magnet_info: The request body containing the magnet link and type of the torrent to download.
    :return: JSON response with download status.
    """
    magnet_link = magnet_info.get("magnet_link")
    torrent_type = magnet_info.get("type")

    if not magnet_link or not magnet_link.startswith("magnet:"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid magnet link provided in the request body"
        )

    if not torrent_type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Torrent type not provided in the request body"
        )

    try:
        # Add the torrent using the magnet link with a category to identify it
        category_name = f"magnet_{torrent_type}_{int(time.time())}"  # Create a unique category name
        savepath = ""
        if torrent_type == "movie":
            savepath="D:\plex\movies"
        elif torrent_type == 'tvshow':
            savepath="D:\plex\TV shows"
        
        qb.download_from_link(magnet_link, category=category_name, savepath=savepath)
        logger.debug(f"Sent download request for magnet link: {magnet_link} with category: {category_name}")

        # Give qbittorrent some time to start the download
        time.sleep(2)

        # Check the status of the torrent
        max_attempts = 10  # Check up to 30 times
        attempts = 0
        while attempts < max_attempts:
            torrents = qb.torrents(category=category_name)
            logger.debug(f"Checking torrents in category '{category_name}', attempt {attempts + 1}/{max_attempts}")
            for torrent in torrents:
                logger.debug(f"Found torrent: {torrent['name']} with magnet URI: {torrent['magnet_uri']}")
                logger.debug(f"Match found for magnet link: {magnet_link}")
                
                if torrent['state'] == 'downloading':
                    return {
                        "message": "Torrent download started successfully",
                        "name": torrent['name'],
                        "hash": torrent['hash'],
                        "status": torrent['state'],
                    }
            attempts += 1
            time.sleep(2)  # Wait 2 seconds before the next check

        return {"message": "Request sent but could not download, check status."}

    except Exception as e:
        logger.error(f"An error occurred while downloading the torrent: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while downloading the torrent: {str(e)}"
        )

# @router.post("/download")
# async def download_torrent_with_magnet(magnet_link_body: dict):
#     """
#     Endpoint to download a torrent using a magnet link provided in the request body.
    
#     :param magnet_link_body: The request body containing the magnet link of the torrent to download.
#     :return: JSON response with download status.
#     """
#     magnet_link = magnet_link_body.get("magnet_link")
#     if not magnet_link or not magnet_link.startswith("magnet:"):
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Invalid magnet link provided in the request body"
#         )

#     try:
#         # Add the torrent using the magnet link with a category to identify it
#         category_name = "magnet_" + str(int(time.time()))  # Create a unique category name
#         qb.download_from_link(magnet_link, category=category_name)
#         logger.debug(f"Sent download request for magnet link: {magnet_link} with category: {category_name}")

#         # Give qbittorrent some time to start the download
#         time.sleep(2)

#         # Check the status of the torrent
#         max_attempts = 10  # Check up to 30 times
#         attempts = 0
#         while attempts < max_attempts:
#             torrents = qb.torrents(category=category_name)
#             logger.debug(f"Checking torrents in category '{category_name}', attempt {attempts + 1}/{max_attempts}")
#             for torrent in torrents:
#                 logger.debug(f"Found torrent: {torrent['name']} with magnet URI: {torrent['magnet_uri']}")
#                 logger.debug(f"Match found for magnet link: {magnet_link}")
                
#                 if torrent['state'] == 'downloading':
#                     return {
#                         "message": "Torrent download started successfully",
#                         "name": torrent['name'],
#                         "hash": torrent['hash'],
#                         "status": torrent['state'],
#                     }
#             attempts += 1
#             time.sleep(2)  # Wait 2 seconds before the next check

#         return {"message": "Request send but could not download, check status."}

#     except Exception as e:
#         logger.error(f"An error occurred while downloading the torrent: {str(e)}")
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail=f"An error occurred while downloading the torrent: {str(e)}"
#         )
@router.get("/info")
async def get_torrent_info():
    torrent_list = []
    try:
        for torrent in qb.torrents():
            torrent_list.append(torrent)
        return torrent_list
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while getting info about torrents: {str(e)}"
        )