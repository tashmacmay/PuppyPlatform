//!! NB - As I am unfamiliar with JavaScript, I followed and adapted the tutorian by Lun Dev Code to learn and achieve project funtionality: https://www.youtube.com/watch?v=gXWohFYrI0M

let cart = []; //Empty array to initialise the cart
let listProducts = [] //Array of website's products for acces from the json file
let CartHTML = document.querySelector('.cart-list');
let iconCartBadge = document.querySelector('.cart-badge');

const initApp = () => { //Called when the application starts, therefore product data is immediately stored to the product list array
    //get the data from the json file
    fetch('products.json')
    .then(response => response.json())
    .then(data => {
        listProducts = data; //data from json is added to the products array ^^^

        //Restore data from local memory on app startup (if it is found)
        if(localStorage.getItem('cart')){
            cart = JSON.parse(localStorage.getItem('cart'));
            addCartToHTML(); //Shows data on screen
        }
    })
}
initApp();

const addToCart = (product_id) => {
    let positionThisProductInCart = cart.findIndex((value) => value.product_id == product_id);
    if(cart.length <= 0){ //If the cart is empty, simply add it
        cart = [{
            product_id: product_id,
            quantity: 1 //ID is automatically 1 as there were none before it
        }]
    }else if(positionThisProductInCart < 0){ //The product is not yet in the cart AT ALL
        cart.push({
            product_id: product_id,
            quantity: 1 //ID is automatically 1 as there were none before it
        });
    }else{
        cart[positionThisProductInCart].quantity = cart[positionThisProductInCart].quantity + 1;
    }
    addCartToHTML(); //The cart content is laid out on the cart page
    addCartToMemory(); //The cart is save to the local storage for PERSISTENCY!
}

const addCartToHTML = () => {
    let totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
    iconCartBadge.innerText = totalQuantity; //Reliably updates cart badge every time Add to Cart is clicked
    if(!CartHTML) return; //The method will end here in the event that the cart page's container does not exist (avoid crash)

    CartHTML.innerHTML = '';
    //let totalQuantity = 0;
    if(cart.length > 0){
        cart.forEach(cartItem => { //cart is array and cartItem is the current item in array
            //totalQuantity = totalQuantity + cart.quantity;
            let newCart = document.createElement('div');
            newCart.classList.add('cart-item');
            newCart.dataset.id = cartItem.product_id;
            let positionProduct = listProducts.findIndex((value) => value.id == cartItem.product_id)
            let info = listProducts[positionProduct];
            newCart.innerHTML = `
            <div class="item-img">
                <img src="${info.image}">
            </div>
            <div class="item-name">
                ${info.name}
            </div>
            <div class="item-total-price">
                ${info.price * cartItem.quantity}
            </div>
            <div class="item-quantity" data-id="${cartItem.product_id}">
                <span class="minus"><</span>
                <span>${cartItem.quantity}</span>
                <span class="plus">></span>
            </div>
            `;
        CartHTML.appendChild(newCart);
        })
    }
    //iconCartBadge.innerText = totalQuantity;
}

const addCartToMemory = () => {
    localStorage.setItem('cart', JSON.stringify(cart)); //save to local storage (can only store string, not array, so we "stringify")
}

if(CartHTML) {
    CartHTML.addEventListener('click', (event) => {
        let positionClick = event.target; //Note what the user has clicked
        if(positionClick.classList.contains('minus') || positionClick.classList.contains('plus')){
            let product_id = positionClick.parentElement.dataset.id;
            let type = 'minus'; //Must determine whether to add or subtract - we assume subtract by default
            if(positionClick.classList.contains('plus')){ //check whether plus, and if so, change accordingly
                type = 'plus'
            }
            changeQuantity(product_id, type);
        }
    })
}

const changeQuantity = (product_id, type) => {
    let positionItemInCart = cart.findIndex((value) => value.product_id == product_id);
    if(positionItemInCart >= 0){
        switch (type) {
            case 'plus':
                cart[positionItemInCart].quantity = cart[positionItemInCart].quantity + 1;
                break;
            default:
                let valueChange = cart[positionItemInCart].quantity - 1; //Check the value once subtracted
                if(valueChange > 0){ //There were more than one of the item, therefore it remains in the cart
                    cart[positionItemInCart].quantity = valueChange;
                }else{ //If there are no more of the product left (quantity now zero)
                   cart.splice(positionItemInCart, 1); 
                }
                break;
        }
    }
    addCartToMemory(); //Update the memory to reflect the quantity change
    addCartToHTML(); //Make the quantity change visible on the cart page
}