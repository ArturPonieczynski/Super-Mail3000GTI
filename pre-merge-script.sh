#!/bin/sh

# Nazwa bieżącej gałęzi
current_branch="$(git rev-parse --abbrev-ref HEAD)"

# Funkcja aktualizująca package.json
update_package_json() {
  type_value=$1
  tmp_file=$(mktemp)

  # Zmienia wartość "type" w package.json i zapisuje do pliku tymczasowego
  jq '.type = "'"$type_value"'"' package.json > "$tmp_file"

  # Zastąp oryginalny package.json
  mv "$tmp_file" package.json
}

# Sprawdzenie, czy jesteśmy w gałęzi develop i aktualizacja package.json
if [ "$current_branch" = "develop" ]; then
  update_package_json "module"
elif [ "$current_branch" = "main" ]; then
  update_package_json "commonjs"
fi

# Dodaj package.json do indeksu, aby zmiany zostały uwzględnione w commitcie
git add package.json
