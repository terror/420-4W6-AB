const getUserAsync = (id, callback) => {
    setTimeout(() => callback(id), 2000);
} 

getUserAsync(1, (id) => { console.log({ userId: id })});
getUserAsync(2, (id) => { console.log({ userId: id})});

const sum = 1 + 1;
console.log(sum);
