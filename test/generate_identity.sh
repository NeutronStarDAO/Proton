echo "begin generate"
for i in {1..10}
do
  dfx identity new --disable-encryption $i
  cp ~/.config/dfx/identity/$i/identity.pem ./identity/
  mv ./identity/identity.pem ./identity/$i.pem
  dfx identity remove $i
done