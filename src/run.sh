for i in {1..8}
do
    echo "Starting Miner $i"
    ts-node miner_new.ts &
done
