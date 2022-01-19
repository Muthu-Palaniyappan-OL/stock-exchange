function appenedDetailsElement(maindiv, classname, text) {
    e = document.createElement('div')
    e.classList = classname
    e.innerText = text
    maindiv.appendChild(e)
}

function insertOrderElement(stockid, orderid, price, qty, qty_executed, dp, dp_client, buy, executed) {
    const maindiv = document.createElement('div')
    if (buy == true) {
        maindiv.classList = 'card-buy';
    } else {
        maindiv.classList = 'card-sell';
    }
    const tick = document.createElement('div')
    if (executed == true) {
        tick.classList = 'tick'
    } else {
        tick.classList = 'cross'
    }
    maindiv.appendChild(tick)
    const stockname = document.createElement('div')
    stockname.classList = 'stockid'
    stockname.innerText = stockid
    maindiv.appendChild(stockname)

    const detailsdiv = document.createElement('div')
    detailsdiv.classList = 'details'

    appenedDetailsElement(detailsdiv, 'orderid', orderid)
    appenedDetailsElement(detailsdiv, 'price', price)
    appenedDetailsElement(detailsdiv, 'qty', qty)
    appenedDetailsElement(detailsdiv, 'qty_executed', qty_executed)
    appenedDetailsElement(detailsdiv, 'dp', dp)
    appenedDetailsElement(detailsdiv, 'dp_client', dp_client)
    maindiv.appendChild(detailsdiv)

    document.body.querySelector('main').appendChild(maindiv)
}

function removeAllChildNodes(parent) {
    parent.innerHTML = ""
}

setInterval(UpdatingTheUI, 2000)

function UpdatingTheUI() {
    removeAllChildNodes(document.querySelector('main'))
    fetch('/admin/orders/all/')
        .then((res) => res.json())
        .then((data) => {
            data.forEach(element => {
                insertOrderElement(element.stockid, element.orderid, element.price, element.qty, element.qty_executed, element.dp, element.dp_client, element.side > 0 ? true : false, element.executed < 0 ? false : true)
            });
        })
        .catch((reason) => {
            console.log(reason);
        })
}