// let catData = {};
//     $.ajax({
//         url: "cat-data.json",
//         async: false,
//         dataType: 'json',
//         success: function(data) {
//             catData = data.cats;
//         }
//     });
// console.log("🚀 ~  catData", catData);
// let breedData = {};
//     $.ajax({
//         url: "breed-data.json",
//         async: false,
//         dataType: 'json',
//         success: function(data) {
//             breedData = data.breeds;
//         }
//     });
// console.log("🚀 ~  breedData", breedData);
// let ownerData = {};
//     $.ajax({
//         url: "owner-data.json",
//         async: false,
//         dataType: 'json',
//         success: function(data) {
//             ownerData = data.owners;
//         }
//     });
// console.log("🚀 ~  ownerData", ownerData);

$.ajaxSetup({
    async: false
});
receiveData = (json,dataName) => {
    let resData = null;
    $.getJSON(json, (data => {
        resData = data[dataName];
    }));
    return resData;
};
receiveIdArr = (inputData) => {
    let resArr = [];
    for (let item of inputData) {
        resArr.push(item.id);
    };
    return resArr;
};
let catData = receiveData("json/cat-data.json","cats");
let catIdArr = receiveIdArr(catData);
let ownerData = receiveData("json/owner-data.json","owners");
let ownerIdArr = receiveIdArr(ownerData);
let breedData = receiveData("json/breed-data.json","breeds");
let breedIdArr = receiveIdArr(breedData);


class Catalog {
    constructor (cssClass,catData,catIdArr,breedData,breedIdArr,ownerData,ownerIdArr) {
        this.catalogBlock = $(cssClass);
        this.catData = catData;
        this.catIdArr = catIdArr;
        this.breedData = breedData;
        this.breedIdArr = breedIdArr;
        this.ownerData = ownerData;
        this.ownerIdArr = ownerIdArr;
        this.createEvents();
    }
    
    createCatTemplate (catId,catImgsHtml,catOwnerHtml,catName,catBreedName,catSex,catAge,catPrice) {
        return `<article class="catalog__goods goods">
        <div class="goods__id">${catId}</div>
        <div class="goods__picture picture">
            ${catImgsHtml}
            ${catOwnerHtml}
        </div>
        <div class="goods__description description">
            <div class="description__name">${catName}</div>
            <div class="description__breed">${catBreedName}</div>
            <div class="description__character">
                <span class="description__sex">${catSex},</span>
                <span class="description__age">${catAge}</span>
            </div>  
        </div>
        <div class="goods__price price">
            <span class="price__value">${catPrice} грн.</span>
            <button class="price__btn" type="button">В корзину</button>
        </div>
    </article>`;
    }
    
    addCatInfo (id) {
        let cat = this.catData[catIdArr.indexOf(id, 0)];
        let catId = cat.id;
        let catName = cat.name;
        let catSex = cat.sex;
        let catAge = cat.age;
        let catColor = cat.color;
        let catPrice = cat.price;
        let catBreedId = cat.breed;
        let catBreedName = this.getCatBreedInfo(catBreedId);
        let catOwnerId = cat.owner;
        let catOwnerHtml = this.getCatOwnerInfo(catOwnerId);
        let catPhotos = cat.photo;
        let catPhotoGroupsNames = [];
        for (let group of catPhotos) {
            for (let size in group) {
                catPhotoGroupsNames.push(size);
            }
        }
        // let catPhotosSmallArr = catPhotos[catPhotoGroupsNames.indexOf("small", 0)].small;
        let catPhotosSmallArr = catPhotos[catPhotoGroupsNames.indexOf("large", 0)].large;

        let catImgAlt = `${catSex} ${catName}, ${catAge}, ${catColor}`;
        let catImgsHtml = `<img class="picture__img" src="${catPhotosSmallArr[0]}" alt="${catImgAlt}">`;
        if (catPhotosSmallArr.length > 1) {
            catImgsHtml += `
            <img class="picture__img" src="${catPhotosSmallArr[1]}" alt="${catImgAlt}">`;
        }
        let currentCat = $(this.createCatTemplate(catId,catImgsHtml,catOwnerHtml,catName,catBreedName,catSex,catAge,catPrice));
        currentCat.appendTo(this.catalogBlock);    
    }
    getCatBreedInfo (id) {
        return this.breedData[this.breedIdArr.indexOf(id, 0)].name;
    }
    getCatOwnerInfo (id) {
        let catOwner = this.ownerData[this.ownerIdArr.indexOf(id, 0)];
        let catOwnerName = catOwner.name;
        let catOwnerLink = catOwner["unsplash-link"];
        let catOwnerHtml = `<a class="picture__owner" href="${catOwnerLink}" target="_blank">by ${catOwnerName}</a>`;
        return catOwnerHtml;
    }
    writeToLacalStorage () {
        let goodsItems = this.catalogBlock.find(".goods");
        let goodsArr = [];
        $.each(goodsItems, (i, goodsItem) => {
            let id = $(goodsItem).children(".goods__id").html();
            let name = $(goodsItem).find(".description__name").html();
            goodsArr.push({"id":id,"name":name});
        });
        localStorage.setItem("cats", JSON.stringify(goodsArr));
        console.log("localStorage", JSON.parse(localStorage.getItem("cats")));
    }
    writeToCookies(e){
        let goodsItemId = $(e.currentTarget).find(".goods__id").text();
        $.cookie.json = true;
        let goodsArr = $.cookie("viewed_items");
        let isItemExistsInGoodsArr = false;
        if (!Array.isArray(goodsArr)) {
            goodsArr = [];
            goodsArr.push({[goodsItemId]:1});
        } else {
            for (const item of goodsArr) {
                if (typeof item[goodsItemId] === "number") {
                    item[goodsItemId]++;
                    isItemExistsInGoodsArr = true;               
                };
            }
            if(!isItemExistsInGoodsArr) {
                goodsArr.push({[goodsItemId]:1});
            }
        }
        $.cookie("viewed_items",goodsArr);
        console.log("viewed_items", $.cookie("viewed_items"));
    }
    createEvents () {
        $.each(this.catIdArr, i => this.addCatInfo(this.catIdArr[i]));
        this.writeToLacalStorage();
        this.catalogBlock.children(".goods").click(this.writeToCookies);
    }
};
const catalog = new Catalog (".catalog",catData,catIdArr,breedData,breedIdArr,ownerData,ownerIdArr);

