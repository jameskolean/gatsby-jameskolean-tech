#Configure Scan

This is your unique identifier for your app

```sash
applicationId: 7f7b3f15-8a4f-4861-ae90-b2efdf932d91
```

Run the following Docker command to start your scan.

```bash
source ~/.hawk/hawk.rc
docker run -e API_KEY=${HAWK_API_KEY} --rm -v $(pwd):/hawk:rw -it stackhawk/hawkscan:latest
```

Once you run your scan head over to the scan dashboard to view your results. If you would like more information about HawkScan, check out our Documentation
