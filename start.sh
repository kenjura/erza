echo "===STARTING ERZA===";
if [[ $EUID -ne 0 ]]; then
        echo "This script must be run as root";
        exit 1
fi

forever stop app/app.js
forever start -l /var/log/erza/forever.log -o /var/log/erza/output.log -e /var/log/erza/err.log -a app/app.js 
forever list