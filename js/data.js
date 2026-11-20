/**
 * YUDU Restaurant Partner Portal - Data & State Store
 * Persistent localStorage storage with reactive notifications
 */

(function () {
  const STORAGE_KEY = "yudu_restaurant_partner_data_v6";

  const defaultDishes = [
    {
      id: "dish-1",
      name: "Chicken Dum Biryani",
      description: "Slow-cooked dum biryani with tender chicken",
      longDescription:
        "Slow-cooked dum biryani with tender chicken, aged basmati rice and house-ground spices. Served with cooling raita.",
      category: "biryani",
      foodType: "non-veg",
      actualPrice: 320,
      sellingPrice: 280,
      serves: "1 person",
      prepTime: 25,
      rating: 4.8,
      reviewsCount: 412,
      tags: ["Bestseller", "Spicy"],
      inStock: true,
      image:
        "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80",
      fallbackImage: "assets/chicken-biryani.png",
    },
    {
      id: "dish-2",
      name: "Mutton Biryani",
      description: "Tender mutton pieces layered with basmati",
      longDescription:
        "Rich and aromatic kachi gosht dum biryani with succulent mutton pieces and authentic spices.",
      category: "biryani",
      foodType: "non-veg",
      actualPrice: 400,
      sellingPrice: 360,
      serves: "1 person",
      prepTime: 30,
      rating: 4.7,
      reviewsCount: 286,
      tags: ["Chef's special"],
      inStock: true,
      image:
        "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=800&auto=format&fit=crop&q=80",
      fallbackImage: "assets/mutton-biryani.png",
    },
    {
      id: "dish-3",
      name: "Paneer Tikka Biryani",
      description: "Smoky grilled paneer with saffron rice",
      longDescription:
        "Marinated cottage cheese cubes chargrilled and layered with saffron spiced fragrant basmati rice.",
      category: "biryani",
      foodType: "veg",
      actualPrice: 270,
      sellingPrice: 240,
      serves: "1 person",
      prepTime: 20,
      rating: 4.5,
      reviewsCount: 198,
      tags: ["New"],
      inStock: true,
      image:
        "https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=800&auto=format&fit=crop&q=80",
      fallbackImage: "assets/paneer-biryani.png",
    },
    {
      id: "dish-4",
      name: "Egg Biryani",
      description: "Boiled eggs on masala-spiced rice",
      longDescription:
        "Crispy pan-fried hard boiled eggs served over seasoned basmati rice with aromatic gravy.",
      category: "biryani",
      foodType: "non-veg",
      actualPrice: 230,
      sellingPrice: 200,
      serves: "1 person",
      prepTime: 18,
      rating: 4.3,
      reviewsCount: 142,
      tags: ["Sold out"],
      inStock: false,
      image:
        "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=80",
      fallbackImage: "assets/egg-biryani.png",
    },
    {
      id: "dish-5",
      name: "Hyderabadi Veg Biryani",
      description: "Seasonal vegetables, mint and fried onions",
      longDescription:
        "Fresh garden vegetables cooked in dum style with long grain basmati rice, mint and caramelized onions.",
      category: "biryani",
      foodType: "veg",
      actualPrice: 250,
      sellingPrice: 220,
      serves: "1 person",
      prepTime: 20,
      rating: 4.4,
      reviewsCount: 165,
      tags: ["Low oil"],
      inStock: true,
      image:
        "https://t4.ftcdn.net/jpg/05/70/58/65/360_F_570586537_TnIgWdCnaTYpgg9gsTyloz5bnvfCtdLl.jpg",
      fallbackImage: "assets/hyderabadi-veg-biryani.jpg",
    },
    // Starters
    {
      id: "dish-6",
      name: "Chicken 65",
      description: "Crispy spicy fried chicken with curry leaves",
      longDescription:
        "Deep fried tender chicken chunks coated with a fiery red masala and tempered with green chillies & curry leaves.",
      category: "starters",
      foodType: "non-veg",
      actualPrice: 260,
      sellingPrice: 230,
      serves: "1-2 persons",
      prepTime: 15,
      rating: 4.9,
      reviewsCount: 310,
      tags: ["Bestseller", "Spicy"],
      inStock: true,
      image:
        "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800&auto=format&fit=crop&q=80",
      fallbackImage: "assets/chicken-biryani.png",
    },
    {
      id: "dish-7",
      name: "Paneer 65",
      description: "Spicy wok tossed paneer cubes with curry leaves",
      longDescription:
        "Cottage cheese cubes tossed in spicy yogurt-chilli batter, fried crisp and garnished with fried curry leaves.",
      category: "starters",
      foodType: "veg",
      actualPrice: 240,
      sellingPrice: 210,
      serves: "1-2 persons",
      prepTime: 15,
      rating: 4.6,
      reviewsCount: 175,
      tags: ["Spicy"],
      inStock: true,
      image:
        "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&auto=format&fit=crop&q=80",
      fallbackImage: "assets/paneer-biryani.png",
    },
    {
      id: "dish-8",
      name: "Apollo Fish",
      description: "Crispy spiced boneless fish tempered in red masala",
      longDescription:
        "Famous Hyderabadi batter-fried fish fillets tossed in spicy yogurt tempering with curry leaves and green chillies.",
      category: "starters",
      foodType: "non-veg",
      actualPrice: 320,
      sellingPrice: 290,
      serves: "1-2 persons",
      prepTime: 18,
      rating: 4.8,
      reviewsCount: 145,
      tags: ["Chef's special"],
      inStock: true,
      image:
        "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&auto=format&fit=crop&q=80",
      fallbackImage: "assets/chicken-biryani.png",
    },
    // Curries
    {
      id: "dish-9",
      name: "Murgh Mirch Masala",
      description: "Succulent chicken in rich onion-tomato gravy",
      longDescription:
        "Tender chicken simmered in a robust, homestyle Hyderabadi masala gravy with whole spices.",
      category: "curries",
      foodType: "non-veg",
      actualPrice: 310,
      sellingPrice: 270,
      serves: "2 persons",
      prepTime: 22,
      rating: 4.7,
      reviewsCount: 220,
      tags: ["Chef's special"],
      inStock: true,
      image:
        "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800&auto=format&fit=crop&q=80",
      fallbackImage: "assets/chicken-biryani.png",
    },
    {
      id: "dish-10",
      name: "Paneer Butter Masala",
      description: "Soft cottage cheese cubes in silky creamy gravy",
      longDescription:
        "Fresh malai paneer simmered in a luscious butter tomato gravy lightly sweetened with honey and fenugreek.",
      category: "curries",
      foodType: "veg",
      actualPrice: 280,
      sellingPrice: 250,
      serves: "2 persons",
      prepTime: 18,
      rating: 4.8,
      reviewsCount: 290,
      tags: ["Bestseller"],
      inStock: true,
      image:
        "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&auto=format&fit=crop&q=80",
      fallbackImage: "assets/paneer-biryani.png",
    },
    {
      id: "dish-11",
      name: "Dal Tadka",
      description: "Yellow lentils tempered with ghee, cumin & garlic",
      longDescription:
        "Slow-simmered yellow lentils tempered with hot ghee, aromatic cumin seeds, golden garlic and Kashmiri red chillies.",
      category: "curries",
      foodType: "veg",
      actualPrice: 200,
      sellingPrice: 170,
      serves: "2 persons",
      prepTime: 15,
      rating: 4.6,
      reviewsCount: 160,
      tags: ["Low oil"],
      inStock: true,
      image: "assets/dal-tadka.jpg",
      fallbackImage: "assets/dal-tadka.jpg",
    },
    // Desserts - Realistic Commercial Food Photography
    {
      id: "dish-12",
      name: "Double Ka Meetha",
      description: "Traditional Hyderabadi bread pudding with saffron & nuts",
      longDescription:
        "Crisp fried bread soaked in saffron cardamom flavored condensed milk rabri, garnished with pistachios, cashews, and almonds.",
      category: "desserts",
      foodType: "veg",
      actualPrice: 160,
      sellingPrice: 140,
      serves: "1 person",
      prepTime: 10,
      rating: 4.9,
      reviewsCount: 340,
      tags: ["Bestseller"],
      inStock: true,
      image: "assets/double-ka-meetha.jpg",
      fallbackImage: "assets/double-ka-meetha.jpg",
    },
    {
      id: "dish-13",
      name: "Gulab Jamun (2 Pcs)",
      description: "Melt-in-mouth milk dumplings in rose sugar syrup",
      longDescription:
        "Golden fried soft khoya dumplings soaked in fragrant rose and green cardamom syrup, garnished with slivered pistachios.",
      category: "desserts",
      foodType: "veg",
      actualPrice: 110,
      sellingPrice: 90,
      serves: "1 person",
      prepTime: 5,
      rating: 4.6,
      reviewsCount: 180,
      tags: ["Sweet"],
      inStock: true,
      image: "assets/gulab-jamun.jpg",
      fallbackImage: "assets/gulab-jamun.jpg",
    },
    {
      id: "dish-16",
      name: "Qubani Ka Meetha",
      description: "Hyderabadi stewed apricot dessert with clotted cream",
      longDescription:
        "Royal Nizami sweet made from slow-stewed dried apricots in spiced sugar syrup, garnished with fresh clotted malai cream and roasted apricot kernels.",
      category: "desserts",
      foodType: "veg",
      actualPrice: 180,
      sellingPrice: 160,
      serves: "1 person",
      prepTime: 5,
      rating: 4.8,
      reviewsCount: 260,
      tags: ["Chef's special", "Bestseller"],
      inStock: true,
      image: "assets/qubani-ka-meetha.jpg",
      fallbackImage: "assets/qubani-ka-meetha.jpg",
    },
    {
      id: "dish-17",
      name: "Shahi Tukda",
      description: "Crisp ghee-fried bread with saffron rabri & pistachios",
      longDescription:
        "Golden fried triangles of bread steeped in fragrant cardamom syrup and drenched in rich thickened saffron rabri, garnished with silver foil and pistachios.",
      category: "desserts",
      foodType: "veg",
      actualPrice: 170,
      sellingPrice: 150,
      serves: "1 person",
      prepTime: 8,
      rating: 4.7,
      reviewsCount: 195,
      tags: ["Sweet"],
      inStock: true,
      image: "assets/shahi-tukda.jpg",
      fallbackImage: "assets/shahi-tukda.jpg",
    },
    {
      id: "dish-18",
      name: "Rasmalai (2 Pcs)",
      description: "Spongy cottage cheese patties in chilled saffron milk",
      longDescription:
        "Soft flattened chhena dumplings soaked in sweet thickened milk infused with green cardamom, saffron strands and crushed emerald pistachios.",
      category: "desserts",
      foodType: "veg",
      actualPrice: 140,
      sellingPrice: 120,
      serves: "1 person",
      prepTime: 5,
      rating: 4.9,
      reviewsCount: 310,
      tags: ["Bestseller", "Sweet"],
      inStock: true,
      image: "assets/rasmalai.jpg",
      fallbackImage: "assets/rasmalai.jpg",
    },
    // Beverages
    {
      id: "dish-14",
      name: "Hyderabadi Irani Chai",
      description: "Dum brewed creamy rich strong milk tea",
      longDescription:
        "Authentic slow dum simmered strong tea decoction blended with sweet condensed milk.",
      category: "beverages",
      foodType: "veg",
      actualPrice: 60,
      sellingPrice: 50,
      serves: "1 person",
      prepTime: 5,
      rating: 4.9,
      reviewsCount: 520,
      tags: ["Bestseller"],
      inStock: true,
      image:
        "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=80",
      fallbackImage: "assets/veg-biryani.png",
    },
    {
      id: "dish-15",
      name: "Fresh Lime Soda (Sweet & Salt)",
      description: "Sparkling fresh lime beverage with mint & rock salt",
      longDescription:
        "Refreshing chilled soda water shaken with fresh lime juice, black salt, and roasted cumin.",
      category: "beverages",
      foodType: "veg",
      actualPrice: 80,
      sellingPrice: 70,
      serves: "1 person",
      prepTime: 5,
      rating: 4.7,
      reviewsCount: 215,
      tags: ["Low oil"],
      inStock: true,
      image:
        "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&auto=format&fit=crop&q=80",
      fallbackImage: "assets/mutton-biryani.png",
    },
  ];

  const defaultDeliveryPartners = [
    {
      id: "dp-1",
      name: "Rahul S.",
      initials: "RS",
      status: "Online • Available",
      isOnline: true,
      distanceKm: 1.2,
      distanceText: "1.2 km",
      rating: 4.8,
      reviewsCount: 328,
      acceptanceRate: 92,
      acceptanceText: "92%",
      recommended: true,
      phone: "+91 98481 23456",
      vehicle: "Hero Splendor · TS 09 EA 4521",
      eta: "Arriving in ~4 min",
      avatar: "assets/rider-rahul.svg",
      fallbackAvatar: "assets/rider-rahul.svg",
    },
    {
      id: "dp-2",
      name: "Amit K.",
      initials: "AK",
      status: "Online • Available",
      isOnline: true,
      distanceKm: 2.0,
      distanceText: "2.0 km",
      rating: 4.6,
      reviewsCount: 210,
      acceptanceRate: 88,
      acceptanceText: "88%",
      recommended: false,
      phone: "+91 98765 43210",
      vehicle: "TVS Jupiter · TS 10 BC 7891",
      eta: "Arriving in ~7 min",
      avatar: "assets/rider-amit.svg",
      fallbackAvatar: "assets/rider-amit.svg",
    },
    {
      id: "dp-3",
      name: "Anand M.",
      initials: "AM",
      status: "Online • Available",
      isOnline: true,
      distanceKm: 3.5,
      distanceText: "3.5 km",
      rating: 4.5,
      reviewsCount: 176,
      acceptanceRate: 85,
      acceptanceText: "85%",
      recommended: false,
      phone: "+91 99887 65432",
      vehicle: "Bajaj Pulsar · TS 08 FG 2341",
      eta: "Arriving in ~11 min",
      avatar: "assets/rider-kiran.svg",
      fallbackAvatar: "assets/rider-kiran.svg",
    },
  ];

  const defaultOrders = [
    {
      id: "YD-20481",
      customer: "Ravi Kumar",
      initials: "RK",
      phone: "+91 98480 22334",
      address: "Flat 402, Sri Krishna Apts, RTC X Roads",
      itemCount: 3,
      items: [
        {
          name: "Chicken Dum Biryani",
          qty: 1,
          price: 280,
          veg: false,
          notes: "Authentic kachi dum style with juicy chicken",
        },
        {
          name: "Mirchi Ka Salan",
          qty: 1,
          price: 120,
          veg: true,
          notes: "Extra spicy chili peanut gravy",
        },
        {
          name: "Thums Up (250ml)",
          qty: 1,
          price: 50,
          veg: true,
          notes: "Chilled bottle",
        },
        { name: "Packaging & Taxes", qty: 1, price: 190, isFee: true },
      ],
      billDetails: {
        itemTotal: 450,
        packaging: 35,
        taxes: 25,
        deliveryFee: 130,
      },
      amount: 640,
      status: "new", // 'new', 'preparing', 'ready', 'completed', 'rejected'
      orderTime: "12:42 PM",
      readyIn: null,
      progress: 0,
      rejectReason: null,
      customerNotes:
        "Please make the biryani extra spicy and add extra lemons, sliced onions, and green chillies. Contactless delivery at door — please do NOT ring doorbell.",
      restaurantNotes:
        "Cooking in dum handi #2. Ensure tamper-evident seal is applied securely.",
      deliveryNotes: "Elevator working. Leave at Flat 402 door.",
      paymentMethod: "Paid Online (UPI - PhonePe)",
      paymentStatus: "Paid",
      txnId: "UPI/9848102948",
      rider: {
        name: "Vikram Singh",
        phone: "+91 98765 43210",
        vehicle: "Honda Activa · TS 09 AB 1234",
        eta: "Arriving in ~4 min",
        otp: "481",
        status: "Assigned to order",
      },
    },
    {
      id: "YD-20476",
      customer: "Mohammed Irfan",
      initials: "MI",
      phone: "+91 97001 88472",
      address: "H.No 3-4-112, Barkatpura, Hyderabad",
      itemCount: 2,
      items: [
        {
          name: "Mutton Biryani",
          qty: 1,
          price: 360,
          veg: false,
          notes: "Succulent tender mutton pieces",
        },
        {
          name: "Extra Raita",
          qty: 1,
          price: 30,
          veg: true,
          notes: "Chilled cucumber mint raita",
        },
        { name: "Taxes", qty: 1, price: 30, isFee: true },
      ],
      billDetails: {
        itemTotal: 390,
        packaging: 15,
        taxes: 15,
        deliveryFee: 0,
      },
      amount: 420,
      status: "preparing",
      orderTime: "12:35 PM",
      readyIn: "8 min",
      progress: 60,
      rejectReason: null,
      customerNotes:
        "Keep raita completely separate and chilled. Please do not send plastic cutlery or paper tissues.",
      restaurantNotes:
        "Mutton pieces checked for tender cut. Packed in thermal pouch.",
      deliveryNotes: "Call customer upon reaching Barkatpura signal.",
      paymentMethod: "Paid Online (GPay)",
      paymentStatus: "Paid",
      txnId: "UPI/7729104928",
      rider: {
        name: "K. Mahesh",
        phone: "+91 99882 33412",
        vehicle: "Hero Splendor · TS 10 CD 5678",
        eta: "Arriving in ~2 min",
        otp: "476",
        status: "En route to restaurant",
      },
    },
    {
      id: "YD-20472",
      customer: "Sana Fatima",
      initials: "SN",
      phone: "+91 94405 11993",
      address: "Plot 18, Chikkadpally Main Road",
      itemCount: 4,
      items: [
        {
          name: "Paneer Tikka Biryani",
          qty: 2,
          price: 480,
          veg: true,
          notes: "Chargrilled smoky paneer",
        },
        {
          name: "Double Ka Meetha",
          qty: 2,
          price: 280,
          veg: true,
          notes: "Extra saffron rabri & pistachios",
        },
        {
          name: "Hyderabadi Irani Chai",
          qty: 2,
          price: 100,
          veg: true,
          notes: "Hot dum brewed chai",
        },
        { name: "Taxes & Packing", qty: 1, price: 260, isFee: true },
      ],
      billDetails: {
        itemTotal: 860,
        packaging: 50,
        taxes: 50,
        deliveryFee: 160,
      },
      amount: 1120,
      status: "preparing",
      orderTime: "12:28 PM",
      readyIn: "3 min",
      progress: 85,
      rejectReason: null,
      customerNotes:
        "Please pack Double Ka Meetha in airtight leak-proof container so it stays cool. Irani chai must be boiling hot in vacuum flask pouch.",
      restaurantNotes:
        "Double ka meetha kept in dessert cooler. Chai dispatched hot.",
      deliveryNotes: "Opposite Chikkadpally Central Library.",
      paymentMethod: "Paid Online (Credit Card)",
      paymentStatus: "Paid",
      txnId: "CC/5549019284",
      rider: {
        name: "Ramesh G.",
        phone: "+91 98490 66554",
        vehicle: "TVS Jupiter · TS 11 EF 9012",
        eta: "Waiting at restaurant",
        otp: "472",
        status: "Waiting at restaurant counter",
      },
    },
    {
      id: "YD-20468",
      customer: "Karthik Rao",
      initials: "KR",
      phone: "+91 98850 77123",
      address: "B-12, Himayatnagar Metro Station",
      itemCount: 2,
      items: [
        {
          name: "Chicken 65",
          qty: 1,
          price: 230,
          veg: false,
          notes: "Fiery red crisp chicken",
        },
        {
          name: "Chicken Dum Biryani",
          qty: 1,
          price: 280,
          veg: false,
          notes: "Classic spicy biryani",
        },
      ],
      billDetails: {
        itemTotal: 510,
        packaging: 0,
        taxes: 0,
        deliveryFee: 0,
      },
      amount: 510,
      status: "ready",
      orderTime: "12:15 PM",
      readyIn: "Ready now",
      progress: 100,
      rejectReason: null,
      customerNotes:
        "Please make Chicken 65 very crisp with extra fried green chillies, curry leaves, and fresh cut lemon wedges on the side.",
      restaurantNotes: "Packed in Bag #4 at counter. Food ready for handover.",
      deliveryNotes: "Drop with lobby receptionist.",
      paymentMethod: "Paid Online (UPI)",
      paymentStatus: "Paid",
      txnId: "UPI/3820194821",
      rider: {
        name: "Shaik Sameer",
        phone: "+91 97003 44119",
        vehicle: "Bajaj Pulsar · TS 08 GH 3456",
        eta: "At restaurant",
        otp: "468",
        status: "Waiting at pickup counter",
      },
    },
    {
      id: "YD-20465",
      customer: "Deepa Venkat",
      initials: "DV",
      phone: "+91 99123 44556",
      address: "Street 4, Ashok Nagar, Hyderabad",
      itemCount: 5,
      items: [
        { name: "Hyderabadi Veg Biryani", qty: 2, price: 440, veg: true },
        { name: "Paneer Butter Masala", qty: 1, price: 250, veg: true },
        { name: "Gulab Jamun (2 Pcs)", qty: 2, price: 180, veg: true },
      ],
      billDetails: {
        itemTotal: 870,
        packaging: 0,
        taxes: 0,
        deliveryFee: 0,
      },
      amount: 870,
      status: "completed",
      orderTime: "11:50 AM",
      readyIn: null,
      progress: 100,
      rejectReason: null,
      customerNotes:
        "Strictly 100% vegetarian preparation. Please ensure separate bag packaging and green veg stickers.",
      restaurantNotes: "Delivered successfully with rider.",
      deliveryNotes: "Gate 2 Ashok Nagar.",
      paymentMethod: "Paid Online (UPI)",
      paymentStatus: "Paid",
      txnId: "UPI/1209384756",
      rider: {
        name: "Syed Arbaaz",
        phone: "+91 99112 88473",
        vehicle: "Honda Shine · TS 07 IJ 7890",
        eta: "Delivered",
        otp: "465",
        status: "Handed to rider · Completed",
      },
    },
    {
      id: "YD-20459",
      customer: "Ankit Sharma",
      initials: "AS",
      phone: "+91 90000 12345",
      address: "Narayanguda Main Road",
      itemCount: 1,
      items: [
        {
          name: "Egg Biryani",
          qty: 1,
          price: 200,
          veg: false,
          notes: "Pan-fried boiled spiced eggs",
        },
      ],
      billDetails: {
        itemTotal: 200,
        packaging: 0,
        taxes: 0,
        deliveryFee: 0,
      },
      amount: 200,
      status: "completed",
      orderTime: "11:20 AM",
      readyIn: null,
      progress: 100,
      rejectReason: null,
      customerNotes: "Please send extra spicy gravy salan.",
      restaurantNotes: "Delivered.",
      deliveryNotes: "Call upon arrival.",
      paymentMethod: "Cash on Delivery",
      paymentStatus: "Collected",
      txnId: "COD-CASH",
      rider: {
        name: "K. Naresh",
        phone: "+91 98881 22345",
        vehicle: "TVS Star · TS 09 KL 2345",
        eta: "Delivered",
        otp: "459",
        status: "Handed to rider · Completed",
      },
    },
  ];

  const defaultSettlements = [
    {
      id: "ST-4822",
      period: "09 – 15 Nov",
      orders: 124,
      amount: 42380,
      status: "Pending",
      date: "15 Nov 2026",
      account: "HDFC Bank •••• 8492",
    },
    {
      id: "ST-4821",
      period: "02 – 08 Nov",
      orders: 138,
      amount: 52410,
      status: "Settled",
      date: "08 Nov 2026",
      account: "HDFC Bank •••• 8492",
    },
    {
      id: "ST-4820",
      period: "26 Oct – 01 Nov",
      orders: 121,
      amount: 47950,
      status: "Settled",
      date: "01 Nov 2026",
      account: "HDFC Bank •••• 8492",
    },
    {
      id: "ST-4819",
      period: "19 – 25 Oct",
      orders: 102,
      amount: 39280,
      status: "Settled",
      date: "25 Oct 2026",
      account: "HDFC Bank •••• 8492",
    },
    {
      id: "ST-4818",
      period: "12 – 18 Oct",
      orders: 115,
      amount: 44600,
      status: "Settled",
      date: "18 Oct 2026",
      account: "HDFC Bank •••• 8492",
    },
    {
      id: "ST-4817",
      period: "05 – 11 Oct",
      orders: 98,
      amount: 36150,
      status: "Settled",
      date: "11 Oct 2026",
      account: "HDFC Bank •••• 8492",
    },
  ];

  const defaultRestaurant = {
    name: "Biryani Factory",
    initials: "BF",
    partnerId: "RP-2041",
    email: "owner@biryanifactory.in",
    phone: "+91 98765 43210",
    since: "Mar 2025",
    verified: true,
    isOnline: true,
    acceptUntil: "11:00 PM",
    openDaysText: "Open all days",
    address: "12-4, RTC Cross roads, Hyderabad - 500001",
    application: {
      id: "APP-2041",
      applicationRef: "YUDU-APP-2026-2041",
      status: "Under Review",
      submittedDate: "18 Nov 2026, 10:30 AM",
      lastUpdated: "Today, 11:45 AM",
      reviewedBy: "YUDU Onboarding Admin",
      underReviewNote: "For applicants still under review",
      remarks:
        "Onboarding application undergoing verification by YUDU compliance team.",
      documents: {
        registration: "Verified",
        fssai: "Verified",
        gst: "Verified",
        pan: "Verified",
        cheque: "Verified",
        kitchenAudit: "Under Review",
      },
    },
    businessHours: {
      open: "10:00 AM",
      close: "11:00 PM",
      display: "10 AM – 11 PM",
      days: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      weekdayHours: "09:00 AM - 10:00 PM",
      weekendHours: "10:00 AM - 11:00 PM",
    },
    deliveryRadius: 5, // km
    notifications: {
      newOrderAlerts: true,
      promotionalUpdates: false,
    },
    bankDetails: {
      accountHolder: "Biryani Factory Foods LLP",
      accountNumber: "50200039481928",
      ifsc: "HDFC0000240",
      bankName: "HDFC Bank, RTC Cross Roads",
    },
    stats: {
      todayOrders: 48,
      ordersChange: "+12% vs yesterday",
      revenue: "₹18,420",
      revenueNum: 18420,
      revenueChange: "+8.4% vs yesterday",
      avgPrepTime: "14 min",
      avgPrepChange: "2 min faster",
      rating: "4.6",
      reviews: "1,248 reviews",
      overviewOrders: "1,248",
      overviewRevenue: "₹4.82L",
      overviewAccepted: "96%",
    },
    weeklyOrders: [
      { day: "Mon", orders: 32, revenue: 12400 },
      { day: "Tue", orders: 40, revenue: 14800 },
      { day: "Wed", orders: 36, revenue: 13600 },
      { day: "Thu", orders: 48, revenue: 17200 },
      { day: "Fri", orders: 58, revenue: 20500 },
      { day: "Sat", orders: 84, revenue: 31200, isPeak: true },
      { day: "Sun", orders: 62, revenue: 23400 },
    ],
    topSellingItems: [
      {
        rank: 1,
        name: "Chicken Dum Biryani",
        orders: "412 orders",
        revenue: "₹1.15L",
      },
      {
        rank: 2,
        name: "Mutton Biryani",
        orders: "286 orders",
        revenue: "₹1.03L",
      },
      {
        rank: 3,
        name: "Paneer Tikka Biryani",
        orders: "198 orders",
        revenue: "₹47.5K",
      },
    ],
  };

  const defaultNotificationsList = [
    {
      id: "notif-1",
      type: "order-new",
      title: "New order #YD-20481 received",
      desc: "Ravi Kumar ordered 3 items (₹640). Waiting for kitchen confirmation.",
      time: "2 mins ago",
      unread: true,
      target: "#orders",
      targetId: "YD-20481",
    },
    {
      id: "notif-2",
      type: "order-accepted",
      title: "Order #YD-20476 in preparation",
      desc: "Accepted for kitchen prep. Estimated completion in 8 minutes.",
      time: "12 mins ago",
      unread: true,
      target: "#orders",
      targetId: "YD-20476",
    },
    {
      id: "notif-3",
      type: "low-stock",
      title: "Low stock alert: Egg Biryani",
      desc: "Marked as Sold out. Update stock inventory in Menu when replenished.",
      time: "45 mins ago",
      unread: true,
      target: "#menu",
      targetId: "dish-4",
    },
    {
      id: "notif-4",
      type: "settlement-available",
      title: "Weekly settlement #ST-4822 available",
      desc: "Amount of ₹42,380 is ready for instant withdrawal payout.",
      time: "3 hours ago",
      unread: false,
      target: "#earnings",
      targetId: "ST-4822",
    },
    {
      id: "notif-5",
      type: "payment-completed",
      title: "Payment completed for #ST-4821",
      desc: "₹52,410 successfully deposited to HDFC Bank A/C ending in 8492.",
      time: "1 day ago",
      unread: false,
      target: "#earnings",
      targetId: "ST-4821",
    },
    {
      id: "notif-6",
      type: "restaurant-status",
      title: "Restaurant is Online",
      desc: "Now accepting incoming online delivery orders until 11:00 PM.",
      time: "Today, 10:00 AM",
      unread: false,
      target: "#restaurant",
      targetId: "",
    },
    {
      id: "notif-7",
      type: "order-cancelled",
      title: "Order #YD-20469 declined",
      desc: "Order declined due to rush hour backlog. Customer notified.",
      time: "Yesterday",
      unread: false,
      target: "#orders",
      targetId: "YD-20469",
    },
  ];

  // Load or initialize store with multi-version fallback and dish reconciliation
  function loadState() {
    try {
      let raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        // Backward compatibility migration from previous version keys
        raw =
          localStorage.getItem("yudu_restaurant_partner_data_v4") ||
          localStorage.getItem("yudu_restaurant_partner_data_v3") ||
          localStorage.getItem("yudu_restaurant_partner_data_v2") ||
          localStorage.getItem("yudu_restaurant_partner_data_v1");
      }

      if (raw) {
        const parsed = JSON.parse(raw);
        let loadedDishes =
          parsed.dishes && Array.isArray(parsed.dishes) ? parsed.dishes : [];

        // Reconcile and ensure all categories (desserts, starters, curries, beverages, biryani) are available
        const existingIds = new Set(loadedDishes.map((d) => d.id));
        defaultDishes.forEach((defaultDish) => {
          if (!existingIds.has(defaultDish.id)) {
            loadedDishes.push(defaultDish);
          }
        });

        // Map of default dishes for fallback image and category recovery
        const defaultMap = {};
        defaultDishes.forEach((d) => {
          defaultMap[d.id] = d;
        });

        // Normalize categories & ensure desserts & dal tadka have real photographic images
        loadedDishes.forEach((d) => {
          const def = defaultMap[d.id];
          if (def && (def.category === "desserts" || def.id === "dish-11" || def.id === "dish-5")) {
            if (def.category === "desserts") d.category = "desserts";
            d.image = def.image;
            d.fallbackImage = def.fallbackImage;
          }
          if (!d.category) d.category = "biryani";
          const cat = d.category.toLowerCase().trim();
          if (cat === "desert" || cat === "dessert") {
            d.category = "desserts";
          }
        });

        let loadedOrders =
          parsed.orders &&
          Array.isArray(parsed.orders) &&
          parsed.orders.length > 0
            ? parsed.orders
            : [...defaultOrders];
        const defaultOrderMap = {};
        defaultOrders.forEach((o) => {
          defaultOrderMap[o.id] = o;
        });
        loadedOrders.forEach((o) => {
          const def = defaultOrderMap[o.id];
          if (def) {
            if (!o.customerNotes) o.customerNotes = def.customerNotes;
            if (!o.restaurantNotes) o.restaurantNotes = def.restaurantNotes;
            if (!o.deliveryNotes) o.deliveryNotes = def.deliveryNotes;
            if (!o.rider) o.rider = def.rider;
            if (!o.paymentMethod) o.paymentMethod = def.paymentMethod;
            if (!o.paymentStatus) o.paymentStatus = def.paymentStatus;
            if (!o.billDetails) o.billDetails = def.billDetails;
          }
        });

        const loadedRestaurant = {
          ...defaultRestaurant,
          ...(parsed.restaurant || {}),
        };
        if (!loadedRestaurant.application) {
          loadedRestaurant.application = { ...defaultRestaurant.application };
        }
        if (!loadedRestaurant.businessHours) {
          loadedRestaurant.businessHours = {
            ...defaultRestaurant.businessHours,
          };
        } else {
          if (!loadedRestaurant.businessHours.weekdayHours) {
            loadedRestaurant.businessHours.weekdayHours =
              defaultRestaurant.businessHours.weekdayHours;
          }
          if (!loadedRestaurant.businessHours.weekendHours) {
            loadedRestaurant.businessHours.weekendHours =
              defaultRestaurant.businessHours.weekendHours;
          }
        }

        return {
          restaurant: loadedRestaurant,
          dishes: loadedDishes,
          orders: loadedOrders,
          settlements:
            parsed.settlements && parsed.settlements.length > 0
              ? parsed.settlements
              : defaultSettlements,
          notifications:
            parsed.notifications && parsed.notifications.length > 0
              ? parsed.notifications
              : defaultNotificationsList,
        };
      }
    } catch (e) {
      console.error("Failed to load state from localStorage", e);
    }
    return {
      restaurant: defaultRestaurant,
      dishes: [...defaultDishes],
      orders: defaultOrders,
      settlements: defaultSettlements,
      notifications: defaultNotificationsList,
    };
  }

  const state = loadState();
  saveState(); // Immediately persist verified state

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      window.dispatchEvent(
        new CustomEvent("yudu-data-changed", { detail: state }),
      );
    } catch (e) {
      console.error("Failed to save state to localStorage", e);
    }
  }

  // Application Status Helper Functions
  function normalizeApplicationStatus(raw) {
    if (!raw) return "Under Review";
    const s = String(raw).trim().toLowerCase();
    if (s.includes("reject") || s.includes("decline") || s.includes("flag")) {
      return "Rejected";
    }
    if (
      s.includes("approve") ||
      s.includes("verified") ||
      s.includes("accept") ||
      s.includes("active") ||
      s.includes("live")
    ) {
      return "Approved";
    }
    if (
      s.includes("pending") ||
      s.includes("queue") ||
      s.includes("submitted")
    ) {
      return "Pending";
    }
    if (
      s.includes("review") ||
      s.includes("audit") ||
      s.includes("progress") ||
      s.includes("hold")
    ) {
      return "Under Review";
    }
    return "Under Review";
  }

  function getApplicationData() {
    const r = state.restaurant;
    const baseApp = r.application || defaultRestaurant.application;
    let app = {
      id: baseApp.id || "APP-2041",
      applicationRef: baseApp.applicationRef || "YUDU-APP-2026-2041",
      status: normalizeApplicationStatus(baseApp.status || "Under Review"),
      restaurantName: r.name,
      owner: (r.bankDetails && r.bankDetails.accountHolder) || r.name,
      email: r.email,
      phone: r.phone,
      submittedDate: baseApp.submittedDate || "18 Nov 2026, 10:30 AM",
      lastUpdated: baseApp.lastUpdated || "Today, 11:45 AM",
      reviewedBy: baseApp.reviewedBy || "YUDU Onboarding Admin",
      underReviewNote: "For applicants still under review",
      remarks:
        baseApp.remarks || "Application details and compliance verification.",
      documents: baseApp.documents || {
        registration: "Verified",
        fssai: "Verified",
        gst: "Verified",
        pan: "Verified",
        cheque: "Verified",
        kitchenAudit: "Under Review",
      },
    };

    // 1. Direct application override in localStorage: 'yudu_restaurant_application' or 'yudu_application_status'
    try {
      const directOverride = localStorage.getItem(
        "yudu_restaurant_application",
      );
      if (directOverride) {
        const parsed = JSON.parse(directOverride);
        if (parsed && typeof parsed === "object") {
          if (parsed.status)
            app.status = normalizeApplicationStatus(parsed.status);
          if (parsed.id) app.id = parsed.id;
          if (parsed.applicationRef) app.applicationRef = parsed.applicationRef;
          if (parsed.lastUpdated) app.lastUpdated = parsed.lastUpdated;
          if (parsed.remarks) app.remarks = parsed.remarks;
        }
      }
      const directStatus = localStorage.getItem("yudu_application_status");
      if (directStatus) {
        app.status = normalizeApplicationStatus(directStatus);
      }
    } catch (e) {}

    // 2. Fetch actual application status from registered restaurant's application data in Admin Dashboard
    try {
      const adminRaw =
        localStorage.getItem("yudu_admin_data_v2") ||
        localStorage.getItem("yudu_admin_data");
      if (adminRaw) {
        const adminData = JSON.parse(adminRaw);
        if (adminData && Array.isArray(adminData.restaurantApplications)) {
          // Match by application id, partnerId, restaurant name, or email
          const match = adminData.restaurantApplications.find((a) => {
            const mId =
              a.id &&
              (a.id === app.id ||
                a.id === r.partnerId ||
                a.id.replace(/\D/g, "") === r.partnerId.replace(/\D/g, ""));
            const mName =
              a.restaurantName &&
              a.restaurantName.toLowerCase().trim() ===
                r.name.toLowerCase().trim();
            const mName2 =
              a.name &&
              a.name.toLowerCase().trim() === r.name.toLowerCase().trim();
            const mEmail =
              a.email &&
              a.email.toLowerCase().trim() === r.email.toLowerCase().trim();
            return mId || mName || mName2 || mEmail;
          });
          if (match) {
            if (match.status)
              app.status = normalizeApplicationStatus(match.status);
            if (match.id) app.id = match.id;
            if (match.date) app.submittedDate = match.date;
            if (match.submittedDate) app.submittedDate = match.submittedDate;
            if (match.remarks) app.remarks = match.remarks;
            app.lastUpdated = "Synced from Admin Dashboard";
          }
        }
      }
    } catch (e) {}

    // 3. Fetch from registration portal: 'yudu_partner_registration'
    try {
      const regRaw = localStorage.getItem("yudu_partner_registration");
      if (regRaw) {
        const regData = JSON.parse(regRaw);
        if (regData && regData.step3) {
          const regName = regData.step1?.restaurantName;
          if (
            !regName ||
            regName.toLowerCase().trim() === r.name.toLowerCase().trim()
          ) {
            if (
              regData.step3.status &&
              !localStorage.getItem("yudu_admin_data_v2") &&
              !localStorage.getItem("yudu_application_status")
            ) {
              app.status = normalizeApplicationStatus(regData.step3.status);
            }
            if (regData.step3.applicationRef)
              app.applicationRef = regData.step3.applicationRef;
            if (regData.step3.submittedAt)
              app.submittedDate = regData.step3.submittedAt;
          }
        }
      }
    } catch (e) {}

    return app;
  }

  function getApplicationStatus() {
    return getApplicationData().status;
  }

  function syncApplicationStatusFromAdmin() {
    const freshApp = getApplicationData();
    const currentApp = state.restaurant.application || {};
    const oldStatus = currentApp.status;

    state.restaurant.application = { ...currentApp, ...freshApp };
    saveState();

    if (oldStatus !== freshApp.status) {
      window.dispatchEvent(
        new CustomEvent("yudu-application-status-changed", {
          detail: {
            status: freshApp.status,
            application: freshApp,
            previousStatus: oldStatus,
          },
        }),
      );
    }
    return freshApp;
  }

  // Export Store API
  window.YUDUStore = {
    getState: () => state,

    // Application Status
    getApplicationData: () => getApplicationData(),
    getApplicationStatus: () => getApplicationStatus(),
    syncApplicationStatusFromAdmin: () => syncApplicationStatusFromAdmin(),

    // Restaurant Online / Offline status
    setRestaurantOnline: (isOnline) => {
      state.restaurant.isOnline = isOnline;
      state.notifications.unshift({
        id: "notif-" + Date.now(),
        type: "restaurant-status",
        title: isOnline ? "Restaurant is Online" : "Restaurant is Offline",
        desc: isOnline
          ? "Accepting customer orders until " + state.restaurant.acceptUntil
          : "Orders are paused. You will not receive new incoming orders.",
        time: "Just now",
        unread: true,
        target: "#home",
        targetId: "",
      });
      saveState();
    },

    // Update restaurant details
    updateRestaurant: (updates) => {
      state.restaurant = { ...state.restaurant, ...updates };
      saveState();
    },

    updateBusinessHours: (
      display,
      open,
      close,
      days,
      weekdayHours,
      weekendHours,
    ) => {
      state.restaurant.businessHours = {
        display: display || `${open} – ${close}`,
        open: open || state.restaurant.businessHours.open,
        close: close || state.restaurant.businessHours.close,
        days: days || state.restaurant.businessHours.days,
        weekdayHours:
          weekdayHours ||
          state.restaurant.businessHours.weekdayHours ||
          "09:00 AM - 10:00 PM",
        weekendHours:
          weekendHours ||
          state.restaurant.businessHours.weekendHours ||
          "10:00 AM - 11:00 PM",
      };
      saveState();
    },

    updateDeliveryRadius: (radius) => {
      state.restaurant.deliveryRadius = Number(radius);
      saveState();
    },

    updateNotificationSettings: (alerts, promos) => {
      state.restaurant.notifications.newOrderAlerts = alerts;
      state.restaurant.notifications.promotionalUpdates = promos;
      saveState();
    },

    updateBankDetails: (details) => {
      state.restaurant.bankDetails = {
        ...state.restaurant.bankDetails,
        ...details,
      };
      saveState();
    },

    // Dishes CRUD
    getDishes: () => state.dishes,

    getDishById: (id) => state.dishes.find((d) => d.id === id),

    saveDish: (dishData) => {
      if (dishData.id) {
        const idx = state.dishes.findIndex((d) => d.id === dishData.id);
        if (idx !== -1) {
          state.dishes[idx] = { ...state.dishes[idx], ...dishData };
        } else {
          state.dishes.push(dishData);
        }
      } else {
        dishData.id = "dish-" + Date.now();
        state.dishes.push(dishData);
      }
      saveState();
      return dishData;
    },

    toggleDishStock: (dishId, inStock) => {
      const dish = state.dishes.find((d) => d.id === dishId);
      if (dish) {
        dish.inStock = inStock !== undefined ? inStock : !dish.inStock;
        // update tag if needed
        if (!dish.inStock && !dish.tags.includes("Sold out")) {
          dish.tags.push("Sold out");
        } else if (dish.inStock) {
          dish.tags = dish.tags.filter((t) => t !== "Sold out");
        }
        if (!dish.inStock) {
          state.notifications.unshift({
            id: "notif-" + Date.now(),
            type: "low-stock",
            title: `Low stock alert: ${dish.name}`,
            desc: `Item is marked as Sold Out. It will not be shown as available to customers.`,
            time: "Just now",
            unread: true,
            target: "#menu",
            targetId: dish.id,
          });
        }
        saveState();
        return dish;
      }
      return null;
    },

    deleteDish: (dishId) => {
      state.dishes = state.dishes.filter((d) => d.id !== dishId);
      saveState();
    },

    // Orders Management
    getOrders: () => state.orders,

    getOrderById: (orderId) => {
      if (!orderId) return null;
      const cleanId = String(orderId).replace(/^#/, "").trim().toLowerCase();
      return state.orders.find((o) => o.id.toLowerCase() === cleanId) || null;
    },

    updateOrderNotes: (orderId, notes) => {
      const cleanId = String(orderId).replace(/^#/, "").trim().toLowerCase();
      const order = state.orders.find((o) => o.id.toLowerCase() === cleanId);
      if (order) {
        order.restaurantNotes = notes;
        saveState();
        return order;
      }
      return null;
    },

    getEligibleDeliveryPartners: (orderId) => {
      return JSON.parse(JSON.stringify(defaultDeliveryPartners));
    },

    acceptOrder: (orderId, prepTimeMinutes = 15, partner = null) => {
      const cleanId = String(orderId).replace(/^#/, "").trim().toLowerCase();
      const order = state.orders.find((o) => o.id.toLowerCase() === cleanId);
      if (order) {
        order.status = "preparing";
        order.readyIn = `Ready in ${prepTimeMinutes} min`;
        order.progress = 35;
        if (partner) {
          order.rider = {
            name: partner.name,
            initials: partner.initials || "RS",
            phone: partner.phone || "+91 98481 23456",
            vehicle: partner.vehicle || "Hero Splendor · TS 09 EA 4521",
            eta:
              partner.eta ||
              `Arriving in ~${Math.round(partner.distanceKm * 3)} min`,
            otp: String(order.id).replace(/\D/g, "").slice(-3) || "481",
            status: "Assigned to order",
            distance: partner.distanceText || `${partner.distanceKm} km`,
            rating: partner.rating,
            reviewsCount: partner.reviewsCount,
            acceptanceRate: partner.acceptanceRate,
            avatar: partner.avatar,
            fallbackAvatar: partner.fallbackAvatar,
          };
        }
        const riderName = order.rider ? order.rider.name : "delivery partner";
        // Add notification
        state.notifications.unshift({
          id: "notif-" + Date.now(),
          type: "order-accepted",
          title: `Order #${order.id} accepted & assigned to ${riderName}`,
          desc: `${order.customer} · ${order.itemCount} items (₹${order.amount}). Assigned to ${riderName}. Ready in ~${prepTimeMinutes} min.`,
          time: "Just now",
          unread: true,
          target: "#order-details?id=" + order.id,
          targetId: order.id,
        });
        saveState();
        return order;
      }
      return null;
    },

    rejectOrder: (orderId, reason) => {
      const cleanId = String(orderId).replace(/^#/, "").trim().toLowerCase();
      const order = state.orders.find((o) => o.id.toLowerCase() === cleanId);
      if (order) {
        order.status = "rejected";
        order.rejectReason = reason || "Declined by restaurant";
        state.notifications.unshift({
          id: "notif-" + Date.now(),
          type: "order-cancelled",
          title: `Order #${order.id} declined`,
          desc: `Reason: ${order.rejectReason}. Customer has been refunded.`,
          time: "Just now",
          unread: true,
          target: "#order-details?id=" + order.id,
          targetId: order.id,
        });
        saveState();
        return order;
      }
      return null;
    },

    updateOrderStatus: (orderId, newStatus) => {
      const cleanId = String(orderId).replace(/^#/, "").trim().toLowerCase();
      const order = state.orders.find((o) => o.id.toLowerCase() === cleanId);
      if (order) {
        order.status = newStatus;
        if (newStatus === "ready") {
          order.progress = 80;
          order.readyIn = "Ready for pickup";
          if (order.rider) order.rider.status = "At restaurant pickup counter";
          state.notifications.unshift({
            id: "notif-" + Date.now(),
            type: "order-accepted",
            title: `Order #${order.id} is Ready!`,
            desc: `Food is packed. Ready for rider pickup for ${order.customer}.`,
            time: "Just now",
            unread: true,
            target: "#order-details?id=" + order.id,
            targetId: order.id,
          });
        } else if (newStatus === "completed") {
          order.progress = 100;
          order.readyIn = "Handed to rider";
          if (order.rider) order.rider.status = "Out for delivery / Delivered";
        }
        saveState();
        return order;
      }
      return null;
    },

    markOrderHandedToRider: (orderId) => {
      const cleanId = String(orderId).replace(/^#/, "").trim().toLowerCase();
      const order = state.orders.find((o) => o.id.toLowerCase() === cleanId);
      if (order) {
        order.status = "completed";
        order.handedToRider = true;
        order.progress = 100;
        order.readyIn = "Handed to rider";
        if (order.rider) {
          order.rider.status = "Out for delivery";
          order.rider.eta = "On the way to customer";
        }
        state.notifications.unshift({
          id: "notif-" + Date.now(),
          type: "order-accepted",
          title: `Order #${order.id} handed to rider`,
          desc: `Food package handed over to ${order.rider ? order.rider.name : "rider"}. En route to ${order.customer}.`,
          time: "Just now",
          unread: true,
          target: "#order-details?id=" + order.id,
          targetId: order.id,
        });
        saveState();
        return order;
      }
      return null;
    },

    // Settlements & Payouts
    getSettlements: () => state.settlements,

    requestPayout: (amount) => {
      const pAmount = amount || 42380;
      const newId = "ST-" + (4822 + Math.floor(Math.random() * 10) + 1);
      const newSettlement = {
        id: newId,
        period: "Current Payout Request",
        orders: 48,
        amount: pAmount,
        status: "Pending",
        date: new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        account:
          state.restaurant.bankDetails.bankName +
          " •••• " +
          state.restaurant.bankDetails.accountNumber.slice(-4),
      };
      state.settlements.unshift(newSettlement);
      state.notifications.unshift({
        id: "notif-" + Date.now(),
        type: "settlement-available",
        title: `Payout request for ₹${pAmount.toLocaleString()} submitted`,
        desc: `Transferred to ${state.restaurant.bankDetails.bankName} (Ref #${newId}). Clears in 24 hrs.`,
        time: "Just now",
        unread: true,
        target: "#earnings",
        targetId: newId,
      });
      saveState();
      return newSettlement;
    },

    // Notifications
    getNotifications: () => state.notifications,

    getUnreadNotificationCount: () => {
      return state.notifications.filter((n) => n.unread).length;
    },

    markNotificationRead: (id) => {
      const notif = state.notifications.find((n) => n.id === id);
      if (notif) {
        notif.unread = false;
        saveState();
      }
    },

    markAllNotificationsRead: () => {
      state.notifications.forEach((n) => (n.unread = false));
      saveState();
    },

    clearAllNotifications: () => {
      state.notifications = [];
      saveState();
    },

    // Reset to initial demo data
    resetToDefaults: () => {
      state.restaurant = JSON.parse(JSON.stringify(defaultRestaurant));
      state.dishes = JSON.parse(JSON.stringify(defaultDishes));
      state.orders = JSON.parse(JSON.stringify(defaultOrders));
      state.settlements = JSON.parse(JSON.stringify(defaultSettlements));
      state.notifications = JSON.parse(
        JSON.stringify(defaultNotificationsList),
      );
      saveState();
    },
  };
})();
