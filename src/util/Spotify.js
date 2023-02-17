let accessToken = ''

const clientId = '09632e61253f46508937db45a72b1403';
const redirectUri = 'http://localhost:3000/';

let Spotify = {

    getAccessToken() {
        if (accessToken) {
            return accessToken;
        } 
        let access_token_match = window.location.href.match(/access_token=([^&]*)/);
        let expires_in = window.location.href.match(/expires_in=([^&]*)/);
    
        if (access_token_match && expires_in) {
        accessToken = access_token_match[1];
        let expiration_time = Number(expires_in[1]);
        // This clears the parameters, allowing us to grab a new access token when it expires.
        window.setTimeout(() => accessToken = '', expiration_time * 1000);
        window.history.pushState('Access Token', null, '/');
        return accessToken;
        }

        else {
            const accessUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}`;
            window.location = accessUrl;
                }
            },

    search(term) {
        const accessToken = Spotify.getAccessToken();
        return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, 
        { headers: {Authorization: `Bearer ${accessToken}`}}
        ).then(response => {
            return response.json();
        }).then(jsonResponse => {
            if (!jsonResponse.tracks) {
                return [];
            }
            return jsonResponse.tracks.items.map(track => ({
                id: track.id,
                name: track.name,
                artist: track.artists[0].name,
                album: track.album.name,
                uri: track.uri
            }));
        });
},

    savePlaylist(name, trackURIs) {
        if (!name || !trackURIs.length) {
            return;
        }
    const accessToken = Spotify.getAccessToken();
    let headers = {Authorization: `Bearer ${accessToken}`};
    let userId;
    return fetch('https://api.spotify.com/v1/me', {headers: headers}
    ).then(response => response.json()
    ).then(jsonResponse => {
        userId = jsonResponse.id;
        return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, 
        {
            headers: headers,
            method: 'POST',
            body: JSON.stringify({name: name})
        })}).then(response => response.json()
        ).then(jsonResponse => {
            let playlistId = jsonResponse.id;
            return fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`,
            {
                headers: headers,
                method: 'POST',
                body: JSON.stringify({uris: trackURIs})
            })
        })

},

}


export default Spotify;