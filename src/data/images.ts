// Demonstration imagery hotlinked from Unsplash. Replace with owned/licensed brand photography before launch.
export interface StockImage { id: string; src: string; alt: string; credit: string }
const u = (id: string, w = 1400) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const images = {
  motorcycle: [
    { id: 'moto-1', src: u('photo-1562793366-5f2d43dd8d9b'), alt: 'Rider in a teal helmet on a motorcycle on a city street with yellow tricycles and buses', credit: 'Unsplash' },
    { id: 'moto-2', src: u('photo-1623930376524-ead3734be423'), alt: 'Motorcyclist riding down a sunlit residential street lined with palm trees', credit: 'Unsplash' },
    { id: 'moto-3', src: u('photo-1761052709946-08d1067f7fef'), alt: 'Man in a blue shirt riding a red commuter motorcycle on a dirt road', credit: 'Unsplash' },
    { id: 'moto-4', src: u('photo-1542990725-319ce3f87c0c'), alt: 'Rider in a cap on a classic black commuter motorcycle', credit: 'Unsplash' },
    { id: 'moto-5', src: u('photo-1534470420-eb6ec40f8831'), alt: 'Rider in a yellow jacket and helmet on a motorcycle on a dirt track surrounded by greenery', credit: 'Unsplash' },
    { id: 'moto-6', src: u('photo-1581422228845-cbd91de24e2d'), alt: 'Rider in a black jacket on an adventure motorcycle with motion-blurred background', credit: 'Unsplash' },
    { id: 'moto-7', src: u('photo-1761666520371-8d4271e3919a'), alt: 'Row of commuter motorcycles parked side by side', credit: 'Unsplash' },
  ],
  tricycle: [
    { id: 'tri-1', src: u('photo-1559897752-11f80cef5173'), alt: 'Yellow keke tricycles driving down a West African street lined with shops', credit: 'Unsplash' },
    { id: 'tri-2', src: u('photo-1548013759-dbf491716275'), alt: 'Yellow keke tricycles seen from behind in city traffic', credit: 'Unsplash' },
    { id: 'tri-3', src: u('photo-1624196639293-b04b44d39b59'), alt: 'Yellow auto-rickshaw on a city road at night with blurred traffic lights', credit: 'Unsplash' },
    { id: 'tri-4', src: u('photo-1757476622221-dc6bd4582dd8'), alt: 'Two green tuk-tuk taxis driving on a busy city street', credit: 'Unsplash' },
    { id: 'tri-5', src: u('photo-1593651184438-4d1fa2af46f0'), alt: 'Tuk-tuk carrying passengers speeding past with motion blur', credit: 'Unsplash' },
  ],
  shuttle: [
    { id: 'shuttle-1', src: u('photo-1776521906834-45551a2004ac'), alt: 'White Toyota minibus driving along a street past parked cars and shops', credit: 'Unsplash' },
    { id: 'shuttle-2', src: u('photo-1715340614342-899407bed6dd'), alt: 'White Mercedes Sprinter minibus on a town road', credit: 'Unsplash' },
    { id: 'shuttle-3', src: u('photo-1534011056808-50c1c6082fe7'), alt: 'White Toyota Coaster minibus parked by the roadside', credit: 'Unsplash' },
    { id: 'shuttle-4', src: u('photo-1787028331201-75a0abb8ab0e'), alt: 'White passenger van parked at an airport terminal drop-off zone', credit: 'Unsplash' },
    { id: 'shuttle-5', src: u('photo-1765739099920-81a456008253'), alt: 'Two black executive passenger vans driving on a city street', credit: 'Unsplash' },
    { id: 'shuttle-6', src: u('photo-1570125909517-53cb21c89ff2'), alt: 'Double-decker intercity coach parked on a road at sunrise', credit: 'Unsplash' },
  ],
  delivery: [
    { id: 'delivery-1', src: u('photo-1607130232670-52123ba5be5c'), alt: 'Delivery rider with an orange box on a scooter riding through the city at dusk', credit: 'Unsplash' },
    { id: 'delivery-2', src: u('photo-1607273685680-6bd976c5a5ce'), alt: 'Courier on a white scooter with a yellow delivery box on the back', credit: 'Unsplash' },
    { id: 'delivery-3', src: u('photo-1566576721346-d4a3b4eaeb55'), alt: 'Hands passing a cardboard parcel from one person to another', credit: 'Unsplash' },
    { id: 'delivery-4', src: u('photo-1758523670564-d1d6a734dc0b'), alt: 'Woman signing for a parcel held by a smiling man at the door', credit: 'Unsplash' },
    { id: 'delivery-5', src: u('photo-1612630741022-b29ec17d013d'), alt: 'Courier unloading a cardboard box from the back of an orange van', credit: 'Unsplash' },
    { id: 'delivery-6', src: u('photo-1627618998627-70a92a874cc2'), alt: 'Brown envelope and a blank white document on a light background', credit: 'Unsplash' },
    { id: 'delivery-7', src: u('photo-1588964895597-cfccd6e2dbf9'), alt: 'Paper grocery bags filled with apples, bananas, cabbage and bread', credit: 'Unsplash' },
    { id: 'delivery-8', src: u('photo-1553413077-190dd305871c'), alt: 'Long warehouse aisle with tall shelves stacked with boxes', credit: 'Unsplash' },
  ],
  market: [
    { id: 'market-1', src: u('photo-1777065851469-71aef898a26f'), alt: 'Bustling open-air African market with vendors and shoppers under brown umbrellas', credit: 'Unsplash' },
    { id: 'market-2', src: u('photo-1585540083814-ea6ee8af9e4f'), alt: 'Market woman selling red peppers piled in woven baskets', credit: 'Unsplash' },
    { id: 'market-3', src: u('photo-1734255026082-82fdc81991f0'), alt: 'Roadside Nigerian market stall with tomatoes and peppers under umbrellas', credit: 'Unsplash' },
  ],
  city: [
    { id: 'city-1', src: u('photo-1648023199223-25d3622bcb13'), alt: 'Aerial view of a busy city street with yellow minibuses, traffic and crowds', credit: 'Unsplash' },
    { id: 'city-2', src: u('photo-1618828665011-0abd973f7bb8'), alt: 'City skyline with a tall office tower and a highway running along the water', credit: 'Unsplash' },
    { id: 'city-3', src: u('photo-1648023200201-8fcede127835'), alt: 'Cable-stayed bridge lit up over the water at night', credit: 'Unsplash' },
    { id: 'city-4', src: u('photo-1526735334552-daff0bd6d53f'), alt: 'Yellow minibuses lined up at a busy roadside bus stop', credit: 'Unsplash' },
    { id: 'city-5', src: u('photo-1574612357719-5dd0a272afe2'), alt: 'City road at night with street lights and office towers', credit: 'Unsplash' },
  ],
  people: [
    { id: 'people-1', src: u('photo-1677935708583-d044791164cf'), alt: 'Excited young woman holding a smartphone against an orange background', credit: 'Unsplash' },
    { id: 'people-2', src: u('photo-1687422808311-a776f467a468'), alt: 'Smiling shop owner at the counter of her provisions store', credit: 'Unsplash' },
    { id: 'people-3', src: u('photo-1766066014237-00645c74e9c6'), alt: 'Smiling support agent wearing a headset at a computer in a call centre', credit: 'Unsplash' },
    { id: 'people-4', src: u('photo-1773063449875-332dff62b6e3'), alt: 'Smiling man and woman riding together in a car', credit: 'Unsplash' },
  ],
  hero: [
    { id: 'hero-1', src: u('photo-1604482311771-f9148b32a8c2'), alt: 'Rider leaning into a turn on a motorcycle against a golden sunset', credit: 'Unsplash' },
    { id: 'hero-2', src: u('photo-1636989098361-c5dfcf3acdde'), alt: 'Silhouette of a motorcyclist riding against a red dusk sky', credit: 'Unsplash' },
  ],
} satisfies Record<string, StockImage[]>;

export const img = (src: string, w: number) => src.replace(/w=\d+/, `w=${w}`);
