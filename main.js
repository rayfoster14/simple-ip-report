var ping = require('ping');
var arp = require('node-arp');
var dns = require('dns');
var macLookup = require('mac-lookup');
const xl = require('excel4node');
const rl = require('readline-sync');
const {promisify} = require('util');
const asyncMacLookupLoad = promisify(macLookup.load).bind(macLookup);

var getMac = function (ip) {
    return new Promise(function (resolve, reject) {
        arp.getMAC(ip, function (err, data) {
            if (!err) {
                resolve(data)
            } else {
                resolve('')
            }
        })
    })
};

var getName = function (ip) {
    return new Promise(function (resolve, reject) {
        dns.reverse(ip, function (err, domains) {
            if (!err) {
                resolve(domains ? domains[0] : 'No name')
            } else {
                resolve('')
            }
        });
    });
};

var lookupMac = async function (mac) {
    var preMac = ""
    for (var e = 0; e < 8; e++) {
        if (mac[e] !== ':') {
            preMac += (mac[e]).toUpperCase();
        }
    }
    return macLookup.lookup(preMac)
}

var createExcelFile = function (data) {
    var wb = new xl.Workbook();
    var ws = wb.addWorksheet('Results');

    ws.cell(1, 1).string('IP')
    ws.cell(1, 2).string('Ping Alive')
    ws.cell(1, 3).string('MAC')
    ws.cell(1, 4).string('Name')
    ws.cell(1, 5).string('Manufacturer')

    for (var r = 0; r < data.length; r++) {
        ws.cell(r + 2, 1).string(data[r].ip)
        ws.cell(r + 2, 2).string(data[r].alive ? 'True' : 'False')
        ws.cell(r + 2, 3).string(data[r].mac)
        ws.cell(r + 2, 4).string(data[r].name)
        ws.cell(r + 2, 5).string(data[r].manuf ? data[r].manuf : '')
    }
    var d = new Date();
    console.log('\nWriting .xlsx file...')
    wb.write(`${d.toISOString().split('T')[0]}_ipscan.xlsx`)
}


var userInput = function () {
    prefixValid = 0;
    var data = {}
    do {
        var prefix = rl.question('Please enter IP Address prefix. (Example: 192.168.0) : ');
        if (prefix == 'q') {
            return 0;
        }
        //Validate
        var errorMsg = "";
        var ipArr = prefix.split('.');
        if (ipArr.length == 3) {
            for (var i = 0; i < 3; i++) {
                if (parseInt(ipArr[i]) > -1 && parseInt(ipArr[i]) < 256) {
                    //Correct
                } else {
                    errorMsg = `IP number ${ipArr[i]} not in range. Must be 0-255`
                }
            }
        } else {
            errorMsg = "Not valid IP Address format. Must be XXX.XXX.XXX"
        }
        if (errorMsg !== "") {
            console.log(errorMsg)
        } else {
            data.prefix = prefix;
            prefixValid = 1
        };

    } while (prefixValid == 0)

    var firstIndex = parseInt(rl.question('Please enter first IP index to scan. (1-255) : '))
    data.first = firstIndex < 1 ? 1 : (firstIndex > 255 ? 255 : firstIndex)
    console.log(`First IP address will be ${prefix}.${data.first}`)

    var lastIndex = parseInt(rl.question(`Please enter final IP index to scan. (${data.first}-255): `))
    data.last = lastIndex > 255 ? 255 : (lastIndex < data.first ? data.first : lastIndex);
    console.log(`Last IP address will be ${prefix}.${data.last}`)

    return data
}

var main = async function () {
    await asyncMacLookupLoad();

    console.log('Simple IP Reporter\n');

    var input = userInput()
    var range = input.last - input.first;

    var hosts = [];
    for (var i = 0; i < range + 1; i++) {
        hosts.push(input.prefix + '.' + (input.first + i))
    }

    console.log('\nStarting Scan...')

    var list = []
    for (var i = 0; i < hosts.length; i++) {
        console.log(`Checking ${hosts[i]}`)
        var record = {
            ip: hosts[i]
        };
        record.alive = (await ping.promise.probe(hosts[i])).alive;
        record.mac = await getMac(hosts[i]);
        record.name = await getName(hosts[i]);
        record.manuf = record.mac !== '' ? await (lookupMac(record.mac)) : '';
        list.push(record)
    }
    createExcelFile(list)
}
main()