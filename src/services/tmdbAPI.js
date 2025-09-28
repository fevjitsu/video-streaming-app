// Mock data service since we don't have actual TMDB API integration
export const getFeaturedContent = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    id: 1,
    title: "The Midnight Sky",
    overview: "A lone scientist in the Arctic races to contact a crew of astronauts returning home to a mysterious global catastrophe.",
    backdrop_path: "/5UkzNSOK561c2QRy2Zr4AkADzLT.jpg",
    poster_path: "/51JcEKuBDm03dW0ow170yHmRoL.jpg",
    release_date: "2020-12-10",
    vote_average: 6.5,
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    gradient: "#0c4a6e, #1e40af"
  };
};

export const getMoviesByGenre = async (genre) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const mockMovies = {
    action: [
      { id: 2, title: "Extraction", poster_path: "/nygOUcBKPHFTbxsYRFZVePqgPK6.jpg", vote_average: 7.5, release_date: "2020-04-24" },
      { id: 3, title: "The Old Guard", poster_path: "/cjr4NWURcVN3gW5FlHeabgBHLrY.jpg", vote_average: 7.1, release_date: "2020-07-10" },
      { id: 4, title: "Project Power", poster_path: "/TnOeov4w0sTtV2gqICqIxVi74V.jpg", vote_average: 6.7, release_date: "2020-08-14" },
      { id: 5, title: "6 Underground", poster_path: "/lnWkyG3LLgbbrIEeyl5mK5VRFe4.jpg", vote_average: 6.1, release_date: "2019-12-13" },
      { id: 6, title: "Spenser Confidential", poster_path: "/wcKFYIiVDvRURrzglV9kGu7fpfY.jpg", vote_average: 6.2, release_date: "2020-03-06" }
    ],
    comedy: [
      { id: 7, title: "The Lovebirds", poster_path: "/5jdLnvALCzL6yNbLHWSdAUj6B2A.jpg", vote_average: 6.5, release_date: "2020-04-22" },
      { id: 8, title: "Eurovision Song Contest", poster_path: "/lgC7k1S29QhcqQ1x3aSnLlp5hxo.jpg", vote_average: 6.9, release_date: "2020-06-26" },
      { id: 9, title: "The Wrong Missy", poster_path: "/vVpXAG2XtOAJ2kqlW6QU6P4MAL2.jpg", vote_average: 6.2, release_date: "2020-05-13" },
      { id: 10, title: "Hubie Halloween", poster_path: "/vNn7p4qA507kXlK1prLdWKnjE6.jpg", vote_average: 5.7, release_date: "2020-10-07" }
    ],
    drama: [
      { id: 11, title: "The Trial of the Chicago 7", poster_path: "/ahf5cVdoaTjH4mgSYkGabbmI2cy.jpg", vote_average: 7.8, release_date: "2020-09-25" },
      { id: 12, title: "Mank", poster_path: "/x6Hj5Tqhkrt1XhiL4Y9jJbW5Y9O.jpg", vote_average: 7.2, release_date: "2020-11-13" },
      { id: 13, title: "The Devil All the Time", poster_path: "/bV7KUXynB7CYVgSfvaBOncE4AlQ.jpg", vote_average: 7.1, release_date: "2020-09-11" },
      { id: 14, title: "Da 5 Bloods", poster_path: "/6n7ASmQ2JLaO2deNcWbF6F5X0hI.jpg", vote_average: 7.1, release_date: "2020-06-12" }
    ],
    horror: [
      { id: 15, title: "His House", poster_path: "/4gKx7Vdj4hT4MJLqk4j3X2Pg3dL.jpg", vote_average: 6.7, release_date: "2020-10-30" },
      { id: 16, title: "The Babysitter: Killer Queen", poster_path: "/fT5yxT4s8c3u5z4d2KqgFvJmWp2.jpg", vote_average: 6.2, release_date: "2020-09-10" },
      { id: 17, title: "Ratched", poster_path: "/hMQdZcM46HwAW6zVTDw2Yf4Yj3s.jpg", vote_average: 7.1, release_date: "2020-09-18" }
    ],
    documentary: [
      { id: 18, title: "The Social Dilemma", poster_path: "/b6RTi5NHU1azbZ2xMPjP6O9uHzB.jpg", vote_average: 8.0, release_date: "2020-09-09" },
      { id: 19, title: "My Octopus Teacher", poster_path: "/uLlfh4Vk9xR6B2w6nyVW0D9V3lF.jpg", vote_average: 8.5, release_date: "2020-09-07" },
      { id: 20, title: "The Last Dance", poster_path: "/5xR1Moi3Vfux3XrI9UJx2q3q3Q9.jpg", vote_average: 9.1, release_date: "2020-04-19" }
    ]
  };
  
  return mockMovies[genre] || [];
};

export const searchMovies = async (query) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const allMovies = Object.values({
    ...mockMovies.action,
    ...mockMovies.comedy,
    ...mockMovies.drama,
    ...mockMovies.horror,
    ...mockMovies.documentary
  }).flat();
  
  return allMovies.filter(movie => 
    movie.title.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 8);
};