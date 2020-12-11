let catData = null;
console.log("🚀 ~ file: cat-shop.js ~ line 2 ~ catData", catData)

$.getJSON("cat-shop-data.json", data => {
    let dataPartArr =[];
    for (let dataPart of data) {
        for (let key in dataPart) {
            dataPartArr.push(key);
        }
    };
    let catData = data[dataPartArr.indexOf("cat")].cat;
    let ownerData = data[dataPartArr.indexOf("owner")].owner;
    let breedData = data[dataPartArr.indexOf("breed")].breed;
    let catIdArr = [];
    let ownerIdArr = [];
    let breedIdArr = [];
    for (let item of catData) {
        catIdArr.push(item.id);
    };
    for (let item of ownerData) {
        ownerIdArr.push(item.id);
    };
    for (let item of breedData) {
        breedIdArr.push(item.id);
    };
    console.log("dataPartArr: ", dataPartArr);
    console.log("cat: ", catIdArr);
    console.log("owner: ", ownerIdArr);
    console.log("breed: ", breedIdArr);

    getCatInfo = (id) => {
        let cat = catData[catIdArr.indexOf(id,0)];
        let catName = cat.name;
        let catSex = cat.sex;
        let catAge = cat.age;
        let catPrice = cat.price;
        let catBreedId = cat.breed;
        getCatBreedInfo(catBreedId);
        let catOwnerId = cat.owner;
        getCatOwnerInfo(catOwnerId);
        let catPhotos = cat.photo;
        let catPhotoGroupsName = [];
        for (let groups of catPhotos) {
            for (let size in groups) {
                catPhotoGroupsName.push(size);
            }
        }
        let catPhotoSmallArr = catPhotos[catPhotoGroupsName.indexOf("small",0)].small;
        let catPhotoLargeArr = catPhotos[catPhotoGroupsName.indexOf("large",0)].large;

        console.log(catPhotoSmallArr)
        console.log(catPhotoLargeArr);

    }
    getCatOwnerInfo = (id) => {
        let catOwner = ownerData[ownerIdArr.indexOf(id,0)];
        let catOwnerName = catOwner.name;
        let catOwnerLink = catOwner["unsplash-link"];
        // console.log(catOwnerName);
    }
    getCatBreedInfo = (id) => {
        let catBreed = breedData[breedIdArr.indexOf(id,0)];
        let catBreedName = catBreed.name;
        // console.log(catBreedName);
    }
    $.each(catIdArr, i => getCatInfo(catIdArr[i]));

    // getCatInfo("3-1");
    // $.each(catData, i => {
    //     console.log(i);
    //     let catName = catData[i].name;
    //     let catSex = catData[i].sex;
    //     let catAge = catData[i].age;
    //     let catPrice = catData[i].price;
    //     let catBreedId = catData[i].breed;

    //     let catBreed = breedData[breedIdArr.indexOf(catBreedId,0)];
    //     let catBreedName = catBreed.name;

    //     let catOwnerId = catData[i].owner;

    //     let catOwner = ownerData[ownerIdArr.indexOf(catOwnerId,0)];
    //     let catOwnerName = catOwner.name;
    //     let catOwnerLink = catOwner["unsplash-link"];

    //     let catPhotos = catData[i].photo;
    //     let catPhotoGroups = [];
    //     for (let groups of catPhotos) {
    //         for (let size in groups) {
    //             catPhotoGroups.push(size);
    //         }
    //     }

    //     console.log("🚀 ~ file: cat-shop.js ~ line 45 ~ catPhotoGroups", catPhotoGroups)

    //     console.log(catPhotos);
    // });

});
