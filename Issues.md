# Issues noted during testing

- When 2 player queue matchmaking it doesnt always find a game, there might be some small misalignemnt for the handling especially with the SSE
- after logging in you always have to refresh the whole page once for it to work (issue might be in authcontext in frontend)
- the various elo labels in the frontend arent changing if there is a change in the backend (might be missing useRef in useUserProfile hook)
- in the stats page in the frontend there are a ton of diagrams missing, these need to be added in the backend
- the credits field across the user profile, backend and database is unnessecary and should be fully removed
- in the elo history graph since the changes are quite low (+-25) the graph should really start from 0, it should take something like the lowest elo in the set - some value to have the bottom limit. the elo history graph should also be hoverable to see various points incuding a label in the elo history where your current elo gets showed
